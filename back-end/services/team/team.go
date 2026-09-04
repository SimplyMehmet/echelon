package team

import (
	"echelon.com/api/types/response"
	"echelon.com/repository/sql"
	"echelon.com/repository/startgg"
	"fmt"
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

	err = t.startGGRepository.GetTournament()
	if err != nil {
		panic(fmt.Errorf("I paniced bro no data err: %v", err))
	}

	return result, nil
}
