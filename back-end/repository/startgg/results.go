package startgg

import (
	"context"
	"github.com/SimplyMehmet/echelon/back-end/repository/startgg/client"
)

func (r *Repository) GetEventAndParticipants(id string) ([]Player, error) {
	var resp []Player
	data, err := client.EventResults(context.Background(), r.client, client.ID(id), 1)
	if err != nil {
		return nil, err
	}

	for _, node := range data.Event.Standings.Nodes {
		for _, participant := range node.Entrant.Participants {
			var entry Player
			entry.ID = string(participant.Player.Id)
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
