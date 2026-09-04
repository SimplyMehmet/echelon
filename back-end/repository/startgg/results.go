package startgg

import (
	"context"
	"echelon.com/repository/startgg/client"
)

func (r *Repository) GetPlayersOfEvent(id int64) ([]Player, error) {
	var resp []Player
	data, err := client.EventResults(context.Background(), r.client, id, 1)
	if err != nil {
		return nil, err
	}

	for _, node := range data.Event.Standings.Nodes {
		for _, participant := range node.Entrant.Participants {
			var entry Player
			entry.ID = participant.Player.Id
			entry.Name = participant.Player.GamerTag
			entry.Placements = append(entry.Placements, PlacementInEvent{
				EventID:   id,
				Placement: int64(node.Placement),
			})
			resp = append(resp, entry)
		}
	}

	return resp, nil
}
