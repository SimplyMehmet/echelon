package startgg

import (
	"context"
	"github.com/SimplyMehmet/echelon/back-end/repository/startgg/client"
	"time"
)

func (r *Repository) GetEventAndParticipants(id string, StartGGSource string) ([]Player, Event, error) {
	var respPlayer []Player
	var respEvent Event
	data, err := client.EventResults(context.Background(), r.client, client.ID(id), 1)
	if err != nil {
		return nil, Event{}, err
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
			respPlayer = append(respPlayer, entry)
		}
	}

	respEvent = Event{
		ID:       string(data.Event.Id),
		Name:     data.Event.Name,
		Entrants: int64(data.Event.NumEntrants),
		Location: data.Event.Tournament.VenueAddress,
		StartsAt: time.Unix(data.Event.StartAt, 0),
		DoubleXP: Seasons[StartGGSource].DoubleXPEventIDs[string(data.Event.Id)],
	}

	return respPlayer, respEvent, nil
}
