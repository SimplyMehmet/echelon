package team

import (
	"github.com/SimplyMehmet/echelon/back-end/api/types/response"
	"github.com/SimplyMehmet/echelon/back-end/repository/sql"
	"github.com/SimplyMehmet/echelon/back-end/repository/startgg"
)

func New(sqlRepository *sql.Repository, startGGRepository *startgg.Repository) *Team {
	return &Team{
		sqlRepository:     sqlRepository,
		startGGRepository: startGGRepository,
	}
}

func (t *Team) GetAllTeams() (response.GetAllTeamsResponse, error) {
	var result response.GetAllTeamsResponse
	teams, err := t.sqlRepository.GetAllTeams()
	if err != nil {
		return result, err
	}

	for _, team := range teams {
		var teamResponse response.TeamResponse
		teamResponse.MapModelIntoStruct(team)
		result.Teams = append(result.Teams, teamResponse)
	}

	return result, nil
}
