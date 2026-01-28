package main

import (
	"encoding/xml"
	"html/template"
)

type SiteConfig struct {
	Name        string `yaml:"name"`
	Url         string `yaml:"url"`
	Description string `yaml:"description"`
	Social      struct {
		Twitter  string `yaml:"twitter"`
		Github   string `yaml:"github"`
		Linkedin string `yaml:"linkedin"`
	} `yaml:"social"`
}

type BlogConfig struct {
	PostsPerPage   int               `yaml:"posts_per_page"`
	DateFormat     string            `yaml:"date_format"`
	ReadingSpeed   int               `yaml:"reading_speed"`
	CategoryColors map[string]string `yaml:"category_colors"`
}

type SeoConfig struct {
	DefaultOgImage string `yaml:"default_og_image"`
	TwitterHandle  string `yaml:"twitter_handle"`
}
type ThemeConfig struct {
	PrimaryColor string `yaml:"primary_color"`
	FontFamily   string `yaml:"font_family"`
	CodeTheme    string `yaml:"code_theme"`
}

type Config struct {
	Site  SiteConfig  `yaml:"site"`
	Blog  BlogConfig  `yaml:"blog"`
	Seo   SeoConfig   `yaml:"seo"`
	Theme ThemeConfig `yaml:"theme"`
}

type AuthorInfo struct {
	Name    string `yaml:"name"`
	Picture string `yaml:"picture"`
}
type Frontmatter struct {
	Title       string     `yaml:"title"`
	Date        string     `yaml:"date"`
	Author      AuthorInfo `yaml:"author"`
	Category    string     `yaml:"category"`
	Tags        []string   `yaml:"tags"`
	Description string     `yaml:"description"`
	Excerpt     string     `yaml:"excerpt"`
	CoverImage  string     `yaml:"coverImage"`
	OgImage     struct {
		Url string `yaml:"url"`
	} `yaml:"ogImage"`
	CanonicalUrl string `yaml:"canonicalUrl"`
	Featured     string `yaml:"featured"`
	Slug         string `yaml:"slug"`
	ReadingTime  string `yaml:"readingTime"`
}

type PostData struct {
	Frontmatter
	Content       template.HTML
	Slug          string
	FormattedDate string
	CategoryColor string
	Site          SiteConfig
	Config        Config
	CurrentYear   int
	LatestPosts   []PostData
}

type ListingData struct {
	Posts       []PostData
	Site        SiteConfig
	Config      Config
	CurrentYear int
}

type SitemapURL struct {
	Loc        string `xml:"loc"`
	LastMod    string `xml:"lastmod"`
	ChangeFreq string `xml:"changefreq"`
	Priority   string `xml:"priority"`
}

type Sitemap struct {
	XMLName xml.Name     `xml:"urlset"`
	Xmlns   string       `xml:"xmlns,attr"`
	URLs    []SitemapURL `xml:"url"`
}
