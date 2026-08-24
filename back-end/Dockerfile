FROM golang:1.25.14-bookworm AS build

RUN apt-get update

WORKDIR /app
COPY ./go.mod .
COPY ./go.sum .

RUN go mod download
COPY . .
RUN rm .env || true
ENV GOCACHE=/root/.cache/go-build
RUN  --mount=type=cache,target="/root/.cache/go-build" CGO_ENABLED=0 go build -v -o /bin/echelon .

FROM scratch AS production
WORKDIR /app
COPY --from=build /bin/echelon .
ENTRYPOINT ["/app/echelon"]