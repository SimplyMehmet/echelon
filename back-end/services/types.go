package services

import (
	"echelon.com/services/player"
	"echelon.com/services/team"
)

type Services struct {
	PlayerService *player.Player
	TeamService   *team.Team
}
