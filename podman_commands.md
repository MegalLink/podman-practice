# Podman & Podman Compose Guide

The values represented in `{}` are placeholders—replace them with your actual values.

---

## 1. Basic Podman Container Operations

- **Create container:**
  ```bash
  podman create hello-world
  ```
- **Start container:**
  ```bash
  podman start -a {container id}
  ```
- **Create and start container:**
  ```bash
  podman run hello-world
  ```
- **Stop container (graceful):**
  ```bash
  podman stop {container id}
  ```
- **Kill container (force):**
  ```bash
  podman kill {container id}
  ```
- **Delete all containers, images, etc.:**
  ```bash
  podman system prune
  ```
- **List all containers (including stopped):**
  ```bash
  podman ps --all
  ```
- **View logs from a container:**
  ```bash
  podman log {container id}
  ```

---

## 2. Working Inside Containers

- **Connect to a running container:**
  ```bash
  podman exec -it {container id} {command}
  ```
  - `-i` attaches STDIN
  - `-t` allocates a TTY (interactive terminal)
  - Common shell commands: `sh`, `bash`, `zsh`, `powershell`

- **Start a container with CLI:**
  ```bash
  podman run -it {image name} sh
  ```

---

## 3. Building and Tagging Images

- **Build from Dockerfile/Containerfile:**
  ```bash
  podman build .
  ```
- **Build from Dockerfile/Containerfile with a specific file name:**
  ```bash
  podman build -f {Docker file name}
  ```
- **Tag an image:**
  ```bash
  podman build -t username/imagename:latest .
  # or
  podman tag {container id} {tag name}
  ```
- **Run a tagged image:**
  ```bash
  podman run username/imagename:latest
  ```

---

## 4. Saving Changes to Images

- **Create container, modify, then save as new image:**
  ```bash
  podman run -it alpine sh
  # install dependencies...
  podman commit -c 'CMD ["redis-server"]' {container id}
  ```
  _Note: Try to avoid using `commit` for production images._

---

## 5. Port Mapping

- **Map ports from host to container:**
  ```bash
  podman run -p {host port}:{container port} {image id}
  # Example:
  podman run -d -p 8080:8080 username/nodeapp
  ```
  The base is: machine makes a request to 8080 -> then redirect to container port 8080

---

## 6. Dockerfile/Containerfile Commands

- `FROM`: Base image
- `RUN`: Execute commands in build
- `CMD`: Default command
- `COPY {src} {dest}`: Copy files from local to container
  - Example: `COPY ./ ./`
- `ADD {src} {dest}`: Like COPY, but can also extract tar files or download from URL

**Difference:**
- `COPY` only copies local files/directories
- `ADD` can also extract tar and download URLs

- `WORKDIR /app`: Set working directory for following commands
  - Keeps files organized and avoids permission issues

- `EXPOSE {port}`: Expose a port to be accessible from outside

---

## 7. Podman run dockerfile with volume
podman run -d -p 3000:3000 -v {WORKING DIR NAME}/node_modules -v $(pwd):/{WORKING DIR NAME} {IMAGE ID or NAME}

example:
podman run -d -p 3000:3000 -v /front-end/node_modules -v $(pwd):/front-end localhost/frontend

# Podman Compose Guide

When using Docker Compose (or Podman Compose), you can define multiple services that are automatically networked together.

**Example:**
```yaml
services:
  app:
    build: .
    ports:
      - "8080:8080"
    depends_on:
      - redis-server
    restart: always
  redis-server:
    image: "redis:alpine"
    ports:
      - "6379:6379"
```
- `image` uses an existing image from Docker Hub.
- `build: .` builds an image from a Dockerfile in the same directory as `docker-compose.yml`.
- You can use `build: ./path/to/dockerfile` to specify a different build context.

## `depends_on`
- Indicates that the `app` service depends on `redis-server`.
- **What it does:** Ensures Docker Compose starts `redis-server` before `app`.
- **Important:**
  - Only controls start order, _not_ readiness.
  - Does **not** wait for Redis to be fully ready—your app may need retry logic.

---

## Compose Commands
What does this do?

It tells Docker Compose to start the redis-server container before starting the app container.
It helps ensure that Redis is at least starting up before your Node.js app tries to connect to it.
Important to know:

depends_on only controls the start order, not the readiness. It does NOT wait for Redis to be fully ready and accepting connections—it just waits for the container to be started.
If your app tries to connect to Redis before it is ready, you may still need to add retry logic in your app.

      
## Useful Podman Compose Commands

Below are the most common `podman compose` commands with explanations and examples. All commands should be run from the directory containing your `docker-compose.yml` file.

- **Start all services (build images if needed):**
  ```bash
  podman compose up
  ```
  Starts all services defined in your compose file. If images do not exist, they will be built.

- **Force rebuild images and start services:**
  ```bash
  podman compose up --build
  ```
  Forces a rebuild of all images before starting the services.

- **Run in detached mode (in the background):**
  ```bash
  podman compose up -d
  ```
  Useful for running your stack without blocking your terminal.

- **Stop and remove all containers, networks, and volumes created by compose:**
  ```bash
  podman compose down
  ```
  Stops all services and cleans up resources.

- **Show all containers created by compose:**
  ```bash
  podman compose ps
  ```
  Lists the status of all containers managed by the current compose project.

- **Show logs from all containers:**
  ```bash
  podman compose logs
  ```
  Displays logs from all containers in the compose project.

- **Show logs in real time (follow mode):**
  ```bash
  podman compose logs -f
  ```
  Useful for monitoring logs as your services run.

- **Restart all services:**
  ```bash
  podman compose restart
  ```
  Restarts all running containers in the compose project.

- **Pause all services:**
  ```bash
  podman compose pause
  ```
  Temporarily suspends all containers.

- **Unpause all services:**
  ```bash
  podman compose unpause
  ```
  Resumes paused containers.

**Tip:** Use `-h` with any command (e.g., `podman compose up -h`) to see all available options.


### Restart Policies in Docker Compose

Restart policies control how Docker (or Podman Compose) handles container restarts when a container exits or fails. Here are the available options:

- **restart: always**
  - The container will always restart if it stops, regardless of the exit status. This includes manual stops, crashes, or system reboots. The only way to stop it is to explicitly remove or stop the service (`podman compose down` or `podman stop`).

- **restart: unless-stopped**
  - Similar to `always`, but the container will not restart if you manually stop it. If the system or Docker daemon restarts, the container will only restart if it wasn't manually stopped before.

- **restart: no**
  - The container will not be restarted automatically, regardless of why it exited. This is the default behavior if no restart policy is set.

- **restart: on-failure**
  - The container will restart only if it exits with a non-zero exit code (i.e., crashes or errors). It will not restart if you manually stop it or if it exits cleanly (exit code 0).

- **restart: on-failure:N**
  - Like `on-failure`, but limits the number of restart attempts to `N`. For example, `on-failure:5` will try to restart the container up to 5 times after failures, then stop trying.

**Tip:** Use restart policies to ensure critical services stay up, but be careful with `always` if your container fails instantly—it could create a restart loop.


# Ejemplo de esta aplicacion 
Para ver cambios con en tiempo real con volumes
Ver el Dockerfile.dev , .dockerignore, package.json y vite.config.ts por que ahi se configuro el host

comandos a correr


podman build -t frontend -f Dockerfile.dev .
podman run -d -p 3000:3000 -v /front-end/node_modules -v $(pwd):/front-end localhost/frontend