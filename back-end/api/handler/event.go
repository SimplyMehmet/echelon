package handler

import (
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"net/http"
)

func (h *Handler) GetAllEvents(ctx *gin.Context) {
	ctx.Status(200)
}

func (h *Handler) GetEventById(ctx *gin.Context) {
	id := ctx.Param("id")
	parsedUuid, err := uuid.Parse(id)
	if err != nil {
		ctx.Status(http.StatusBadRequest)
		ctx.Abort()
		return
	}

	resp, err := h.services.EventService.GetEventByID(parsedUuid)
	if err != nil {
		ctx.Status(http.StatusInternalServerError)
		ctx.Abort()
		return
	}

	ctx.JSON(http.StatusOK, resp)
}
