package startgg

import (
	"echelon.com/config"
	"github.com/Khan/genqlient/graphql"
	"net/http"
)

type authTransport struct {
	wrapped http.RoundTripper
	token   string
}

func (t *authTransport) RoundTrip(req *http.Request) (*http.Response, error) {
	req.Header.Set("Authorization", "Bearer "+t.token)
	req.Header.Set("Content-Type", "application/json")
	req.Method = http.MethodPost
	return t.wrapped.RoundTrip(req)
}

func New() *Repository {
	cfg := config.Load()
	httpClient := &http.Client{
		Transport: &authTransport{
			wrapped: http.DefaultTransport,
			token:   cfg.StartGGAPIKey,
		},
	}

	return &Repository{
		client: graphql.NewClient(cfg.StartGGAPIUrl, httpClient),
	}
}
