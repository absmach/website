package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"html/template"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"time"

	"github.com/yuin/goldmark"
	emoji "github.com/yuin/goldmark-emoji"
	highlighting "github.com/yuin/goldmark-highlighting/v2"
	meta "github.com/yuin/goldmark-meta"
	"github.com/yuin/goldmark/extension"
	"github.com/yuin/goldmark/parser"
)

type Builder struct {
	Config      *Config
	ContentDir  string
	OutputDir   string
	TemplateDir string
	CacheFile   string
	Force       bool
}

func NewBuilder(config *Config, contentDir, outputDir, templateDir, cacheFile string, force bool) *Builder {
	return &Builder{
		Config:      config,
		ContentDir:  contentDir,
		OutputDir:   outputDir,
		TemplateDir: templateDir,
		CacheFile:   cacheFile,
	}
}

func (b *Builder) Build() error {
	if err := os.MkdirAll(b.OutputDir, 0o755); err != nil {
		return fmt.Errorf("faile to create output dir: %w", err)
	}

	postTmp, err := template.ParseFiles(filepath.Join(b.TemplateDir, "post.html"))
	if err != nil {
		return fmt.Errorf("failed to parse post template: %w", err)
	}
	listingTmp, err := template.ParseFiles(filepath.Join(b.TemplateDir, "listing.html"))
	if err != nil {
		return fmt.Errorf("failed to parse listing template: %w", err)
	}

	cache := b.loadCache()
	newCache := make(map[string]string)

	md := goldmark.New(
		goldmark.WithExtensions(
			meta.Meta,
			extension.GFM,
			emoji.Emoji,
			highlighting.NewHighlighting(
				highlighting.WithStyle(b.Config.Theme.CodeTheme),
			),
		),
		goldmark.WithParserOptions(
			parser.WithAutoHeadingID(),
		),
	)

	files, err := filepath.Glob(filepath.Join(b.ContentDir, "*.md"))
	if err != nil {
		return fmt.Errorf("failed to list markdown files: %w", err)
	}

	if len(files) == 0 {
		return nil
	}

	var posts []PostData
	builtCount := 0
	skippedCount := 0

	anyChanged := false
	if len(cache) != len(files) {
		anyChanged = true
	}

	for _, file := range files {
		fileHash, err := GetFileHash(file)
		if err == nil {
			newCache[file] = fileHash
			if cache[file] != fileHash {
				anyChanged = true
			}
		}

		post, err := b.parsePost(md, file)
		if err != nil {
			fmt.Printf("Error processing %s: %v\n", file, err)
			continue
		}
		posts = append(posts, *post)
	}

	isFeatured := func(s string) bool {
		return strings.EqualFold(strings.TrimSpace(s), "true")
	}

	parse := func(s string) time.Time {
		t, err := time.Parse("2006-01-02", s)
		if err != nil {
			return time.Time{}
		}
		return t
	}

	sort.Slice(posts, func(i, j int) bool {
		p1, p2 := posts[i], posts[j]

		f1 := isFeatured(p1.Frontmatter.Featured)
		f2 := isFeatured(p2.Frontmatter.Featured)
		if f1 != f2 {
			return f1
		}
		return parse(p1.Frontmatter.Date).After(parse(p2.Frontmatter.Date))
	})

	if !anyChanged && !b.Force {
		skippedCount = len(posts) + 1
	} else {
		for i := range posts {
			post := &posts[i]

			var nextRead []PostData
			for j := 0; j < len(posts); j++ {
				if posts[j].Slug != post.Slug {
					nextRead = append(nextRead, posts[j])
				}
				if len(nextRead) == 3 {
					break
				}
			}
			post.LatestPosts = nextRead

			postDir := filepath.Join(b.OutputDir, post.Slug)
			if err := os.MkdirAll(postDir, 0o755); err != nil {
				fmt.Printf("Error creating post dir %s: %v\n", postDir, err)
				continue
			}
			outputPath := filepath.Join(postDir, "index.html")
			f, err := os.Create(outputPath)
			if err != nil {
				fmt.Printf("Error creating output file %s: %v\n", outputPath, err)
				continue
			}

			if err := postTmp.Execute(f, post); err != nil {
				f.Close()
				fmt.Printf("Error rendering %s: %v\n", post.Slug, err)
				continue
			}
			f.Close()
			builtCount++
		}

		listingData := ListingData{
			Posts:       posts,
			Site:        b.Config.Site,
			Config:      *b.Config,
			CurrentYear: time.Now().Year(),
		}

		if err := os.MkdirAll(b.OutputDir, 0o755); err != nil {
			return fmt.Errorf("blog dir doesn't exist: %w", err)
		}

		listOut := filepath.Join(b.OutputDir, "index.html")

		fl, err := os.Create(listOut)
		if err != nil {
			return fmt.Errorf("failed to create listing file: %w", err)
		}
		defer fl.Close()

		if err := listingTmp.Execute(fl, listingData); err != nil {
			return fmt.Errorf("failed to render listing: %w", err)
		}
		builtCount++
	}

	b.saveCache(newCache)

	sitemapPath := filepath.Join(filepath.Dir(b.OutputDir), "sitemap.xml")
	if err := b.updateSitemap(posts, files, sitemapPath); err != nil {
		fmt.Printf("Warning: Failed to update sitemap: %v\n", err)
	}

	fmt.Println("\nBuild complete!")
	fmt.Printf("   Built: %d\n", builtCount)
	fmt.Printf("   Skipped: %d\n", skippedCount)
	fmt.Printf("   Total: %d\n", len(files))

	return nil
}

func (b *Builder) loadCache() map[string]string {
	cache := make(map[string]string)
	if _, err := os.Stat(b.CacheFile); os.IsNotExist(err) {
		return cache
	}
	data, err := os.ReadFile(b.CacheFile)
	if err != nil {
		return cache
	}
	json.Unmarshal(data, &cache)
	return cache
}

func (b *Builder) saveCache(cache map[string]string) {
	data, err := json.MarshalIndent(cache, "", "  ")
	if err != nil {
		fmt.Printf("Warning: Failed to save cache: %v\n", err)
		return
	}
	os.WriteFile(b.CacheFile, data, 0o644)
}

func (b *Builder) parsePost(md goldmark.Markdown, filepathStr string) (*PostData, error) {
	content, err := os.ReadFile(filepathStr)
	if err != nil {
		return nil, fmt.Errorf("failed to read file: %w", err)
	}

	var buf bytes.Buffer
	context := parser.NewContext()

	if err := md.Convert(content, &buf, parser.WithContext(context)); err != nil {
		return nil, fmt.Errorf("failed to convert markdown: %w", err)
	}

	metaData := meta.Get(context)

	fm := Frontmatter{
		Title:       getString(metaData, "title"),
		Date:        getString(metaData, "date"), // Expecting string YYYY-MM-DD
		Author:      getAuthor(metaData),
		Category:    getString(metaData, "category"),
		Description: getString(metaData, "description"),
		Excerpt:     getString(metaData, "excerpt"),
		CoverImage:  getString(metaData, "coverImage"),
		Featured:    getString(metaData, "featured"),
		Slug:        getString(metaData, "slug"),
		ReadingTime: getString(metaData, "readingTime"), // optional
	}

	if val, ok := metaData["canonicalUrl"]; ok {
		fm.CanonicalUrl = fmt.Sprintf("%v", val)
	}
	if val, ok := metaData["ogImage"]; ok {
		if vm, ok := val.(map[interface{}]interface{}); ok {
			if u, ok := vm["url"]; ok {
				fm.OgImage.Url = fmt.Sprintf("%v", u)
			}
		} else if vm, ok := val.(map[string]interface{}); ok {
			if u, ok := vm["url"]; ok {
				fm.OgImage.Url = fmt.Sprintf("%v", u)
			}
		}
	}
	if val, ok := metaData["tags"]; ok {
		if tags, ok := val.([]interface{}); ok {
			for _, t := range tags {
				fm.Tags = append(fm.Tags, fmt.Sprintf("%v", t))
			}
		}
	}

	if fm.Slug == "" {
		fm.Slug = filepath.Base(filepathStr)
		fm.Slug = fm.Slug[:len(fm.Slug)-len(filepath.Ext(fm.Slug))]
	}
	if fm.Description == "" {
		fm.Description = fm.Excerpt
	}

	slug := fm.Slug
	htmlContent := buf.String()

	readingTime := fm.ReadingTime
	if readingTime == "" {
		fm.ReadingTime = CalculateReadingTime(htmlContent, b.Config.Blog.ReadingSpeed)
	}

	catColor := "primary"
	if c, ok := b.Config.Blog.CategoryColors[fm.Category]; ok {
		catColor = c
	}

	ogImage := fm.OgImage.Url
	if ogImage == "" {
		if fm.CoverImage != "" {
			ogImage = fm.CoverImage
		} else {
			fm.OgImage.Url = b.Config.Seo.DefaultOgImage
		}
	}

	canonicalUrl := fm.CanonicalUrl
	if canonicalUrl == "" {
		fm.CanonicalUrl = fmt.Sprintf("%s/blog/%s/", b.Config.Site.Url, slug)
	}
	return &PostData{
		Frontmatter:   fm,
		Content:       template.HTML(htmlContent), // Mark as safe HTML
		Slug:          slug,
		FormattedDate: FormatDate(fm.Date, b.Config.Blog.DateFormat),
		CategoryColor: catColor,
		Site:          b.Config.Site,
		Config:        *b.Config,
		CurrentYear:   time.Now().Year(),
	}, nil
}

func getString(m map[string]interface{}, key string) string {
	if v, ok := m[key]; ok {
		return fmt.Sprintf("%v", v)
	}
	return ""
}

func normalizePicture(s string) string {
	s = strings.TrimSpace(s)

	if s == "" ||
		strings.EqualFold(s, "undefined") ||
		strings.EqualFold(s, "null") ||
		s == "<nil>" {
		return ""
	}

	return s
}

func getGitHubAuthor() (string, string) {
	eventPath := os.Getenv("GITHUB_EVENT_PATH")
	if eventPath != "" {
		data, err := os.ReadFile(eventPath)
		if err == nil {
			var event struct {
				PullRequest struct {
					User struct {
						Login     string `json:"login"`
						AvatarURL string `json:"avatar_url"`
					} `json:"user"`
				} `json:"pull_request"`
			}
			if err := json.Unmarshal(data, &event); err == nil && event.PullRequest.User.Login != "" {
				return event.PullRequest.User.Login, event.PullRequest.User.AvatarURL
			}
		}
	}

	actor := os.Getenv("GITHUB_ACTOR")
	if actor != "" {
		return actor, fmt.Sprintf("https://github.com/%s.png", actor)
	}

	return "", ""
}

func getAuthor(m map[string]interface{}) AuthorInfo {
	const defaultAvatar = "/img/avatar.png"

	author := AuthorInfo{
		Picture: defaultAvatar,
	}

	if v, ok := m["author"]; ok {
		switch am := v.(type) {

		case map[interface{}]interface{}:
			name := fmt.Sprintf("%v", am["name"])
			if name != "" && name != "<nil>" {
				author.Name = name
			}

			if pic := normalizePicture(fmt.Sprintf("%v", am["picture"])); pic != "" {
				author.Picture = pic
			}

		case map[string]interface{}:
			author.Name = getString(am, "name")

			if pic := normalizePicture(getString(am, "picture")); pic != "" {
				author.Picture = pic
			}
		}
	}

	if author.Name == "" || author.Name == "<nil>" {
		name, pic := getGitHubAuthor()
		if name != "" {
			author.Name = name
		}
		if pic != "" && (author.Picture == "" || author.Picture == defaultAvatar) {
			author.Picture = pic
		}
	}

	return author
}
