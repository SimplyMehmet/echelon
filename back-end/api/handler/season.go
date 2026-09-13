package handler

import (
	"github.com/gin-gonic/gin"
	"net/http"
)

func (h *Handler) GetAllSeasons(ctx *gin.Context) {
	resp, err := h.services.SeasonService.GetAllSeasons()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, err)
	}

	ctx.JSON(http.StatusOK, resp)
}
