import { Button } from "../components/button";
import { Input } from "../components/input";
import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import * as VOXELIZE from "@voxelize/client";
import * as THREE from "three";

import LogoImage from "../assets/tree_transparent.svg";

import { setupWorld } from "src/core/world";

const GameWrapper = styled.div`
  background: black;
  position: absolute;
  width: 100vw;
  height: 100vh;
  top: 0;
  left: 0;
  overflow: hidden;
`;

const GameCanvas = styled.canvas`
  position: absolute;
  width: 100%;
  height: 100%;
`;

const ControlsWrapper = styled.div`
  position: fixed;
  width: 100vw;
  height: 100vh;
  background: #00000022;
  z-index: 100000;

  & > div {
    backdrop-filter: blur(2px);
    padding: 32px 48px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 16px;
    position: absolute;
    top: 50%;
    left: 50%;
    z-index: 1000;
    transform: translate(-50%, -50%);
    background: #fff2f911;
    border-radius: 4px;
  }

  & img {
    width: 60px;
  }

  & h3 {
    color: #eee;
    margin-bottom: 12px;
  }

  & .error {
    font-size: 0.8rem;
    color: red;
  }
`;

let BACKEND_SERVER_INSTANCE = new URL(window.location.href);

if (BACKEND_SERVER_INSTANCE.origin.includes("localhost")) {
  BACKEND_SERVER_INSTANCE.port = "4000";
}

const BACKEND_SERVER = BACKEND_SERVER_INSTANCE.toString();

const App = () => {
  const [world, setWorld] = useState("world3");
  const [name, setName] = useState("");
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState("");
  const [locked, setLocked] = useState(false);

  const domRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const networkRef = useRef<VOXELIZE.Network | null>(null);
  const controlsRef = useRef<VOXELIZE.RigidControls | null>(null);

  useEffect(() => {
    if (
      domRef.current &&
      canvasRef.current &&
      !networkRef.current &&
      !controlsRef.current
    ) {
      const clock = new VOXELIZE.Clock();
      const world = new VOXELIZE.World({ textureDimension: 128 });

      const camera = new THREE.PerspectiveCamera(
        80,
        domRef.current.offsetWidth / domRef.current.offsetHeight,
        0.1,
        5000
      );

      const renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current,
        antialias: true,
      });
      renderer.setSize(
        renderer.domElement.offsetWidth,
        renderer.domElement.offsetHeight
      );
      domRef.current.appendChild(renderer.domElement);

      const controls = new VOXELIZE.RigidControls(
        camera,
        renderer.domElement,
        world
      );

      const network = new VOXELIZE.Network();

      if (!networkRef.current) {
        networkRef.current = network;
      }

      if (!controlsRef.current) {
        controlsRef.current = controls;
      }

      controls.on("unlock", () => {
        setLocked(false);
      });

      controls.on("lock", () => {
        setLocked(true);
      });

      network.on("join", () => {
        setJoined(true);
      });

      network.on("leave", () => {
        setJoined(false);
      });

      setupWorld(world);

      window.addEventListener("resize", () => {
        const width = domRef.current?.offsetWidth as number;
        const height = domRef.current?.offsetHeight as number;

        renderer.setSize(width, height);

        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      });

      network
        .cover(world)
        .connect({ serverURL: BACKEND_SERVER, secret: "test" })
        .then(() => {
          network.join("world3").then(() => {
            setName(network.clientInfo.username);

            const animate = () => {
              requestAnimationFrame(animate);

              controls.update(clock.delta);

              world.update(
                camera.position,
                clock.delta,
                controls.getDirection()
              );

              network.flush();

              clock.update();

              renderer.render(world, camera);
            };

            // joinOrResume(false);
            animate();
          });
        });
    }
  }, [domRef, canvasRef]);

  const joinOrResume = (lock = true) => {
    if (!networkRef.current || !controlsRef.current) return;

    if (joined) {
      if (lock) {
        controlsRef.current.lock();
      }
      return;
    }

    if (!networkRef.current.joined) {
      networkRef.current?.join(world);
    }
  };

  const leave = () => {
    if (!networkRef.current) return;
    networkRef.current.leave();
  };

  return (
    <GameWrapper ref={domRef}>
      <GameCanvas ref={canvasRef} />
    </GameWrapper>
  );
};

export default App;
