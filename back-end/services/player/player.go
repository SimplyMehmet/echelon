package player

import (
	"github.com/SimplyMehmet/echelon/back-end/api/types/request"
	"github.com/SimplyMehmet/echelon/back-end/api/types/response"
	"github.com/SimplyMehmet/echelon/back-end/repository/sql"
	"github.com/SimplyMehmet/echelon/back-end/repository/sql/models"
)

func New(sqlRepository *sql.Repository) *Player {
	return &Player{
		sqlRepository: sqlRepository,
	}
}

func (p *Player) CreatePlayer(player request.CreatePlayerRequest) error {
	err := p.sqlRepository.CreatePlayer(models.Player{
		Name:         player.Name,
		Attended:     player.Attended,
		ScoreCurrent: player.ScoreCurrent,
		ScoreTotal:   player.ScoreTotal,
		TeamID:       player.TeamID,
	})

	if err != nil {
		return err
	}

	return nil
}

func (p *Player) GetAllPlayers() (response.GetAllPlayerResponse, error) {
	resp := response.GetAllPlayerResponse{}
	players, err := p.sqlRepository.GetAllPlayers()
	if err != nil {
		return resp, err
	}

	for _, player := range players {
		var entry response.PlayerResponse
		entry.MapModelIntoStruct(player)
		resp.Players = append(resp.Players, entry)
	}

	return resp, nil
}
