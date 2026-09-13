package player

import (
	"github.com/SimplyMehmet/echelon/back-end/api/types/response"
	"github.com/SimplyMehmet/echelon/back-end/repository/sql"
)

func New(sqlRepository *sql.Repository) *Player {
	return &Player{
		sqlRepository: sqlRepository,
	}
}

func (p *Player) GetAllPlayers() (response.GetAllPlayerResponse, error) {
	resp := response.GetAllPlayerResponse{}
	players, err := p.sqlRepository.GetAllPlayers()
	if err != nil {
		return resp, err
	}

	for _, player := range players {
		var respEntry response.PlayerResponse
		playerEvents, err := p.sqlRepository.GetPLayerEventsByPlayerID(player.ID)
		if err != nil {
			return resp, err
		}

		respEntry.MapModelIntoStruct(player, playerEvents)
		resp.Players = append(resp.Players, respEntry)
	}

	return resp, nil
}
