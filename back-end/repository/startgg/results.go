package startgg

import (
	"context"
	"time"

	"github.com/SimplyMehmet/echelon/back-end/repository/startgg/client"
)

func (r *Repository) GetEventAndParticipants(id string, StartGGSource string) ([]Player, Event, error) {
	var respPlayer []Player
	var respEvent Event
	var standingsNodes []client.GetEventStandingsEventStandingsStandingConnectionNodesStanding
	var setNodes []client.GetEventSetsEventSetsSetConnectionNodesSet
	eventStandingPage := 1
	eventSetsPage := 1

	dataStandings, err := client.GetEventStandings(context.Background(), r.client, client.ID(id), eventStandingPage)
	if err != nil {
		return nil, Event{}, err
	}

	standingsNodes = append(standingsNodes, dataStandings.Event.Standings.Nodes...)
	for eventStandingPage < dataStandings.Event.Standings.PageInfo.TotalPages {
		eventStandingPage++
		dataStandings, err = client.GetEventStandings(context.Background(), r.client, client.ID(id), eventStandingPage)
		if err != nil {
			return nil, Event{}, err
		}

		standingsNodes = append(standingsNodes, dataStandings.Event.Standings.Nodes...)
	}

	for _, node := range standingsNodes {
		for _, participant := range node.Entrant.Participants {
			var entry Player
			entry.ID = string(participant.Player.Id)
			entry.Name = participant.Player.GamerTag
			entry.Placements = append(entry.Placements, PlacementInEvent{
				EventID:   id,
				Placement: node.Placement,
			})
			entry.Team = hardcodedTeams[entry.ID]
			respPlayer = append(respPlayer, entry)
		}
	}

	pointMultiplier, ok := Seasons[StartGGSource].PointMultiplier[string(dataStandings.Event.Id)]
	if !ok {
		pointMultiplier = 1
	}

	respEvent = Event{
		ID:              string(dataStandings.Event.Id),
		Name:            dataStandings.Event.Name,
		Entrants:        dataStandings.Event.NumEntrants,
		Location:        dataStandings.Event.Tournament.VenueAddress,
		StartsAt:        time.Unix(dataStandings.Event.StartAt, 0),
		PointMultiplier: pointMultiplier,
		State:           string(dataStandings.Event.State),
	}

	dataEventSets, err := client.GetEventSets(context.Background(), r.client, client.ID(id), eventSetsPage)
	if err != nil {
		return nil, Event{}, err
	}

	setNodes = append(setNodes, dataEventSets.Event.Sets.Nodes...)
	for eventSetsPage < dataEventSets.Event.Sets.PageInfo.TotalPages {
		eventSetsPage++
		dataEventSets, err = client.GetEventSets(context.Background(), r.client, client.ID(id), eventSetsPage)
		if err != nil {
			return nil, Event{}, err
		}

		setNodes = append(setNodes, dataEventSets.Event.Sets.Nodes...)
	}

	for _, node := range setNodes {
		var set Set
		set.ID = string(node.Id)
		set.Name = node.FullRoundText
		set.Round = node.Round
		if node.StartedAt > 0 {
			set.StartedAt = time.Unix(node.StartedAt, 0)
		}

		if node.CompletedAt > 0 {
			set.CompletedAt = time.Unix(node.CompletedAt, 0)
		}

		if len(node.Stream.Id) > 0 {
			set.OnStream = true
		}

		for _, setPlayer := range node.Slots {
			if len(setPlayer.Entrant.Participants) < 1 {
				continue
			}

			var player SetPlayer
			player.ID = string(setPlayer.Entrant.Participants[0].Player.Id)
			player.Name = setPlayer.Entrant.Name
			player.Score = int(setPlayer.Standing.Stats.Score.Value)
			set.Players = append(set.Players, player)
		}

		respEvent.Sets = append(respEvent.Sets, set)
	}

	return respPlayer, respEvent, nil
}
