package season

import (
	"fmt"
	"github.com/SimplyMehmet/echelon/back-end/api/types/response"
	"github.com/SimplyMehmet/echelon/back-end/repository/sql"
)

func New(sqlRepository *sql.Repository) *Season {
	return &Season{
		sqlRepository: sqlRepository,
	}
}

func (s *Season) GetAllSeasons() (response.GetAllSeasonsResponse, error) {
	var resp response.GetAllSeasonsResponse
	seasons, err := s.sqlRepository.GetAllSeasons()
	if err != nil {
		return resp, fmt.Errorf("could not fetch seasons %v", err)
	}

	for _, season := range seasons {
		var seasonResp response.SeasonResponse
		seasonResp.MapModelIntoResponse(season)
		resp.Seasons = append(resp.Seasons, seasonResp)
	}

	return resp, nil
}
