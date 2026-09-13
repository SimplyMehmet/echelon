package team

import (
	"github.com/SimplyMehmet/echelon/back-end/api/types/response"
	"github.com/SimplyMehmet/echelon/back-end/repository/sql"
	"github.com/SimplyMehmet/echelon/back-end/repository/sql/models"
)

func New(sqlRepository *sql.Repository) *Team {
	return &Team{
		sqlRepository: sqlRepository,
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
		var totalScore int64
		for _, player := range team.Players {
			playerEvents, queryErr := t.sqlRepository.GetPLayerEventsByPlayerID(player.ID)
			if queryErr != nil {
				return result, err
			}

			for _, playerEvent := range playerEvents {
				if !playerEvent.Event.Season.Current {
					continue
				}

				points := models.PointsByPlacement[playerEvent.Placement]
				if playerEvent.Event.DoublePoints {
					points *= 2
				}

				totalScore += points
			}
		}

		teamResponse.MapModelIntoStruct(team, totalScore)
		result.Teams = append(result.Teams, teamResponse)
	}

	return result, nil
}
