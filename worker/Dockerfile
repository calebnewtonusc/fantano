# Worker: Python pipeline that scrapes the channel, parses descriptions,
# and upserts new tracks into Postgres. Runs on a Railway cron schedule.
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

RUN apt-get update \
 && apt-get install -y --no-install-recommends ca-certificates curl \
 && rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir uv

WORKDIR /app

COPY pyproject.toml uv.lock README.md ./
COPY src/ ./src/
COPY db/ ./db/

RUN uv sync --frozen --no-dev

ENV DATA_DIR=/data
VOLUME /data

CMD ["uv", "run", "fantano", "run"]
