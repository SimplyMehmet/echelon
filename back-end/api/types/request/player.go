package request

import "github.com/google/uuid"

type CreatePlayerRequest struct {
	Name         string     `json:"name"`
	Attended     int64      `json:"attended"`
	ScoreTotal   int64      `json:"scoreTotal"`
	ScoreCurrent int64      `json:"scoreCurrent"`
	TeamID       *uuid.UUID `json:"teamId"`
}
