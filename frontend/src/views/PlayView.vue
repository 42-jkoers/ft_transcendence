<template>
  <div v-if="isGameFinish">
    <h3>Game is over, the winner is</h3>
    <div class="winner flex justify-content-center">
      <h2>
        {{ winnerUsername }}
      </h2>
    </div>

    <h4>Play again:</h4>
    <JoinGameQueueAutoVue />
  </div>
  <div v-else>
    <div class="card">
      <div
        class="username flex justify-content-around flex-wrap card-container"
      >
        <div class="username flex align-items-center justify-content-center">
          {{ senderUsername }}
        </div>
        <div class="flex align-items-center justify-content-center">
          {{ receiverUsername }}
        </div>
      </div>
      <canvas width="300" height="400" id="game"></canvas>
      <!-- TODO: variable instead 300 400 magic number -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject, onMounted, onUnmounted, ref } from "vue";
import { Socket } from "socket.io-client";
import { useRoute } from "vue-router";
import { GameInPlay, Frame } from "@backend/game/render";
import JoinGameQueueAutoVue from "@/components/JoinGameQueueAuto.vue";

const isGameFinish = ref<boolean>(false);

function draw(context: CanvasRenderingContext2D, game: GameInPlay, f: Frame) {
  const { width, height, grid } = game.canvas;
  context.clearRect(0, 0, width, height);

  context.fillStyle = "white";
  for (const paddle of f.paddles) {
    context.fillRect(paddle.x, paddle.y, grid, paddle.height);
  }

  if (f.paddles[0]) {
    context.fillText(String(f.paddles[0].score), width / 2 - 90, 80);
  }
  if (f.paddles[1]) {
    context.fillText(String(f.paddles[1].score), width / 2 + 80, 80);
  }

  context.fillRect(
    f.ball.x - f.ball.radius / 2,
    f.ball.y - f.ball.radius / 2,
    f.ball.radius * 2,
    f.ball.radius * 2
  );

  // walls
  context.fillStyle = "lightgrey";
  context.fillRect(0, 0, width, grid);
  context.fillRect(0, height - grid, width, height);

  // dotted line down the middle
  for (let i = grid; i < height - grid; i += grid * 2) {
    context.fillRect(width / 2 - grid / 2, i, grid, grid);
  }
}

function initCanvas(game: GameInPlay, ctx: CanvasRenderingContext2D) {
  // console.log("init", game);
  ctx.canvas.width = game.canvas.width;
  ctx.canvas.height = game.canvas.height;
  ctx.font = "35px courier"; // TODO: scale
}

function scaleFrame(frame: Frame, scaler: number) {
  for (const paddle of frame.paddles) {
    paddle.height *= scaler;
    paddle.width *= scaler;
    paddle.x *= scaler;
    paddle.y *= scaler;
  }
  frame.ball.x *= scaler;
  frame.ball.y *= scaler;
  frame.ball.radius *= scaler;
}

function scaleGame(game: GameInPlay, scalar: number) {
  game.canvas.height *= scalar;
  game.canvas.width *= scalar;
  game.canvas.grid *= scalar;
}

function keyEventToPaddleUpdate(e: KeyboardEvent): -1 | 1 | undefined {
  switch (e.key) {
    case "w":
    case "W":
    case "ArrowUp":
      return 1;

    case "s":
    case "S":
    case "ArrowDown":
      return -1;
    default:
      return undefined;
  }
}

const senderUsername = ref("");
const receiverUsername = ref("");
const winnerUsername = ref("");
const socket: Socket = inject("socketioInstance") as Socket;
onMounted(() => {
  const canvas = document.getElementById("game") as HTMLCanvasElement;
  const context = canvas.getContext("2d") as CanvasRenderingContext2D;
  const route = useRoute();
  const scaler = 500;
  let gameInPlay: GameInPlay | undefined;

  socket.on("BadRequestException", (response) => {
    console.log("BadRequestException", response);
  });

  socket.on("getGame", (game: GameInPlay, usernames) => {
    console.log("usernames", usernames);
    senderUsername.value = usernames.sender;
    receiverUsername.value = usernames.receiver;
    scaleGame(game, scaler);
    gameInPlay = game;
    initCanvas(game, context);
  });

  socket.on("gameFrame", (frame: Frame) => {
    scaleFrame(frame, scaler);
    // console.log(frame);
    if (gameInPlay) {
      draw(context, gameInPlay, frame);
    }
  });

  socket.on("gameFinished", (username: string) => {
    console.log("username:", username);
    winnerUsername.value = username;
    isGameFinish.value = true;
  });

  let lastPaddleUpdate: -1 | 0 | 1 = 0;

  function sendKeyUpdate(direction: "keydown" | "keyup", update: -1 | 0 | 1) {
    if (lastPaddleUpdate === update) return;
    lastPaddleUpdate = update;
    socket.emit("paddleUpdate", { update });
  }

  window.addEventListener("keydown", (e) => {
    const update = keyEventToPaddleUpdate(e);
    if (update == undefined) return;
    sendKeyUpdate("keydown", update);
  });

  window.addEventListener("keyup", (e) => {
    if (keyEventToPaddleUpdate(e) !== undefined) sendKeyUpdate("keyup", 0);
  });

  socket.emit("getGame", { data: parseInt(route.params.id as string) });
});

onUnmounted(() => {
  socket.off("getGame");
  socket.off("gameFrame");
  socket.off("gameFinished");
});
</script>
<style>
.username {
  color: aliceblue;
}

.winner {
  font-weight: 700;
  color: aliceblue;
}
</style>
