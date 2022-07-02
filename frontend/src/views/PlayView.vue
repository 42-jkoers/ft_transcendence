<template>
  <p class="message">
    This is the play page (look at the console for all info)
  </p>

  <canvas width="300" height="400" id="game"></canvas>
  <!-- TODO: variable instead 300 400 magic number -->
</template>

<script setup lang="ts">
import { inject, onMounted } from "vue";
import { Socket } from "socket.io-client";
import { useRoute } from "vue-router";
import { Paddle, GameInPlay, Frame, Player } from "@backend/game/game.dto";

function draw(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  paddles: Paddle[],
  grid: number
) {
  context.clearRect(0, 0, width, height);

  // leftPaddle.y += leftPaddle.dy;
  // rightPaddle.y += rightPaddle.dy;

  // prevent paddles from going through walls
  // if (leftPaddle.y < grid) {
  //   leftPaddle.y = grid;
  // } else if (leftPaddle.y > maxPaddleY) {
  //   leftPaddle.y = maxPaddleY;
  // }

  // if (rightPaddle.y < grid) {
  //   rightPaddle.y = grid;
  // } else if (rightPaddle.y > maxPaddleY) {
  //   rightPaddle.y = maxPaddleY;
  // }

  context.fillStyle = "white";
  for (const paddle of paddles) {
    context.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
  }

  // ball.x += ball.dx;
  // ball.y += ball.dy;

  // context.fillRect(ball.x, ball.y, ball.width, ball.height);

  // walls
  context.fillStyle = "lightgrey";
  context.fillRect(0, 0, width, grid);
  context.fillRect(0, height - grid, width, height);

  // dotted line down the middle
  for (let i = grid; i < height - grid; i += grid * 2) {
    context.fillRect(width / 2 - grid / 2, i, grid, grid);
  }
}

onMounted(() => {
  const g_canvas = document.getElementById("game") as HTMLCanvasElement;
  const g_context = g_canvas.getContext("2d") as CanvasRenderingContext2D;
  const socket: Socket = inject("socketioInstance") as Socket;
  const route = useRoute();
  let g_game;

  socket.on("BadRequestException", (response) => {
    console.log("BadRequestException", response);
  });

  socket.on("getGame", (game: GameInPlay) => {
    g_game = game;
  });

  socket.on("gameFrame", (frame: Frame) => {
    draw(g_context, g_canvas.width, g_canvas.height, frame.paddles, 15);
  });

  window.addEventListener("keydown", (e) => {
    switch (e.key) {
      case "w":
      case "W":
      case "ArrowUp":
        socket.emit("paddleUpdate", { update: 1 });
        break;

      case "s":
      case "S":
      case "ArrowDown":
        socket.emit("paddleUpdate", { update: -1 });
        break;
    }
  });

  socket.on("clientConnected", () => {
    console.log("connected");
    socket.emit("getGame", parseInt(route.params.id as string));

    //   socket.emit("getUserType", route.params.id);
    //   socket.on("getUserType", (type: string) => {
    //     console.log("you are a", type);
    //   });
  });
  socket.connect();
});
</script>
