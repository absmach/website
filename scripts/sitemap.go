package main

import (
	"encoding/xml"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"
)

func parseSitemap(path string) (*Sitemap, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, fmt.Errorf("failed to read sitemap: %w", err)
	}

	var sitemap Sitemap
	if err := xml.Unmarshal(data, &sitemap); err != nil {
		return nil, fmt.Errorf("failed to parse sitemap: %w", err)
	}

	return &sitemap, nil
}

func writeSitemap(sitemap *Sitemap, path string) error {
	output, err := xml.MarshalIndent(sitemap, "", "    ")
	if err != nil {
		return fmt.Errorf("failed to marshal sitemap: %w", err)
	}

	xmlContent := append([]byte(xml.Header), output...)
	xmlContent = append(xmlContent, '\n')

	if err := os.WriteFile(path, xmlContent, 0o644); err != nil {
		return fmt.Errorf("failed to write sitemap: %w", err)
	}

	return nil
}

func (b *Builder) updateSitemap(posts []PostData, files []string, sitemapPath string) error {
	sitemap, err := parseSitemap(sitemapPath)
	if err != nil {
		return err
	}

	blogURLs := make(map[string]int)
	blogPrefix := b.Config.Site.Url + "/blog/"

	for i, url := range sitemap.URLs {
		if strings.HasPrefix(url.Loc, blogPrefix) {
			blogURLs[url.Loc] = i
		}
	}

	slugModTimes := make(map[string]time.Time, len(files))
	for _, file := range files {
		info, err := os.Stat(file)
		if err != nil {
			continue
		}
		slug := strings.TrimSuffix(filepath.Base(file), ".md")
		slugModTimes[slug] = info.ModTime()
	}

	today := time.Now().Format("2006-01-02")
	for _, post := range posts {
		blogURL := blogPrefix + post.Slug + "/"
		lastMod := today

		if modTime, ok := slugModTimes[post.Slug]; ok {
			lastMod = modTime.Format("2006-01-02")
		}

		if idx, exists := blogURLs[blogURL]; exists {
			sitemap.URLs[idx].LastMod = lastMod
		} else {
			newURL := SitemapURL{
				Loc:        blogURL,
				LastMod:    lastMod,
				ChangeFreq: "monthly",
				Priority:   "0.7",
			}
			sitemap.URLs = append(sitemap.URLs, newURL)
		}
	}

	if sitemap.Xmlns == "" {
		sitemap.Xmlns = "http://www.sitemaps.org/schemas/sitemap/0.9"
	}

	return writeSitemap(sitemap, sitemapPath)
}
