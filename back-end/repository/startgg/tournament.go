package startgg

import (
	"context"
	"echelon.com/repository/startgg/client"
	"fmt"
)

func (r *Repository) GetTournament() error {
	events, err := client.TournamentEvents(context.Background(), r.client, "levels-tekken-8-2026-season-1")
	if err != nil {
		return err
	}

	fmt.Println("events", events, "tournament", events.Tournament, "events part 2", events.Tournament.Events)
	return nil
}
