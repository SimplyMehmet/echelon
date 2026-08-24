package player

import (
	"echelon.com/api/types/response"
	"echelon.com/repository/sql"
	"echelon.com/repository/sql/models"
)

func New(sqlRepository *sql.Repository) *Player {
	return &Player{
		sqlRepository: sqlRepository,
	}
}

func (p *Player) CreatePlayer(name string) error {
	err := p.sqlRepository.CreatePlayer(models.Player{Name: name})
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
