package handler

import (
	"github.com/gin-gonic/gin"
	"net/http"
)

func (h *Handler) GetAllTeams(ctx *gin.Context) {
	teams, err := h.services.TeamService.GetAllTeams()
	if err != nil {
		ctx.Status(http.StatusInternalServerError)
		ctx.Abort()
		return
	}

	ctx.JSON(http.StatusOK, teams)
}
