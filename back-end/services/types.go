package services

import (
	"github.com/SimplyMehmet/echelon/back-end/services/player"
	"github.com/SimplyMehmet/echelon/back-end/services/season"
	"github.com/SimplyMehmet/echelon/back-end/services/team"
)

type Services struct {
	PlayerService *player.Player
	TeamService   *team.Team
	SeasonService *season.Season
}
