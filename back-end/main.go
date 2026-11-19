package main

import (
	"fmt"
	"time"

	"github.com/SimplyMehmet/echelon/back-end/api"
	"github.com/SimplyMehmet/echelon/back-end/config"
	"github.com/SimplyMehmet/echelon/back-end/repository/sql"
	"github.com/SimplyMehmet/echelon/back-end/repository/sql/models"
	"github.com/SimplyMehmet/echelon/back-end/repository/startgg"
	"github.com/SimplyMehmet/echelon/back-end/services"
)

func main() {
	cfg := config.Load()
	startGGRepository := startgg.New()
	sqlRepository, err := sql.New()
	if err != nil {
		panic(fmt.Errorf("failed to connect database %v", err))
	}

	if cfg.MigrateDatabase {
		startGGPlayerData, startGGSeasonData, migrateErr := startGGRepository.ImportStartGGData()
		if migrateErr != nil {
			panic(fmt.Errorf("failed to connect to startGG api %v", migrateErr))
		}

		migrateErr = sqlRepository.Migrate(startGGPlayerData, startGGSeasonData)
		if migrateErr != nil {
			panic(fmt.Errorf("failed to migrate startGG api %v", migrateErr))
		}
	}

	go checkDBForInProgressEvents(sqlRepository, startGGRepository)
	serviceCollection := services.New(sqlRepository)
	api.RunServer(serviceCollection)
}

// tested and works however not needed for now needs to be refactored to a service
func checkDBForInProgressEvents(sqlRepository *sql.Repository, startGGRepository *startgg.Repository) {
	ticker := time.NewTicker(time.Second * 10)

	fmt.Println("looking for events")
	for range ticker.C {
		events, err := sqlRepository.GetEventsOfToday()

		if err != nil {
			panic(err)
		}

		for _, event := range events {
			fmt.Println("found event of today =>", event.Name)
			// fetch from startGGRepository
			players, startGGEvent, err := startGGRepository.GetEventAndParticipants(event.StartGGID, event.Season.StartGGID)
			if err != nil {
				panic(err)
			}

			fmt.Println("updating event")
			// update the event
			updatedEvent, err := sqlRepository.UpsertStartGGEvent(startGGEvent, event.SeasonID)
			if err != nil {
				panic(err)
			}

			mappedPlayerSets := make(map[string][]models.PlayerSet)
			for _, set := range startGGEvent.Sets {
				updatedSet, err := sqlRepository.UpsertStartGGSet(set, updatedEvent.ID)
				if err != nil {
					panic(err)
				}

				for _, player := range set.Players {
					mappedPlayerSets[player.ID] = append(mappedPlayerSets[player.ID], models.PlayerSet{
						Score: player.Score,
						SetID: updatedSet.ID,
					})
				}

			}

			fmt.Println("updating players and standings of event")
			// update the players and standings
			for _, player := range players {
				mappedPlayer := startgg.MappedPlayer{
					Name:       player.Name,
					Placements: player.Placements,
					Attended:   len(player.Placements),
					StartGGID:  player.ID,
					Team:       player.Team,
				}

				foundPlayer, err := sqlRepository.UpsertStartGGPlayer(mappedPlayer)
				if err != nil {
					panic(err)
				}

				err = sqlRepository.UpsertStartGGPlayerEventRelations(
					mappedPlayer.Placements,
					foundPlayer,
					[]models.Event{updatedEvent},
				)

				if err != nil {
					panic(err)
				}
				for _, set := range mappedPlayerSets[player.ID] {
					set.PlayerID = foundPlayer.ID
					_, err := sqlRepository.UpsertPlayerSetRelation(set)
					if err != nil {
						panic(err)
					}
				}
			}
		}
	}
}
