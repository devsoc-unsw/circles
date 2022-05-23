import React from "react";
import { motion } from "framer-motion";
import { Typography } from "antd";
import "./index.less";
import circlesLogo from "../../assets/circlesLogo.svg";

const { Title } = Typography;
const PageNotFound = () => (
  <>
    <div className="main-con">
      <div className="grid-circle">
        <motion.div
          className="box"
          animate={{
            scale: [1, 1.1, 1.1, 1, 1],
            borderRadius: ["50%", "50%", "50%", "50%", "50%"],
            rotate: [0, 0, 360, 360, 0],
          }}
          transition={{
            duration: 4,
            yoyo: Infinity,
          }}
        >
          <img alt="circles-logo" src={circlesLogo} width="200" height="200" />
        </motion.div>
        <motion.div
          className="box"
          animate={{
            scale: [1, 1.1, 1.1, 1, 1],
            borderRadius: ["50%", "50%", "50%", "50%", "50%"],
            rotate: [180, 180, 360, 360, 0],
          }}
          transition={{
            duration: 4,
            yoyo: Infinity,
          }}
        >
          <img alt="circles-logo" src={circlesLogo} width="200" height="200" />
        </motion.div>
        <motion.div
          className="box"
          animate={{
            scale: [1, 1.1, 1.1, 1, 1],
            borderRadius: ["50%", "50%", "50%", "50%", "50%"],
            rotate: [0, 0, 360, 360, 0],
          }}
          transition={{
            duration: 4,
            yoyo: Infinity,
          }}
        >
          <img alt="circles-logo" src={circlesLogo} width="200" height="200" />
        </motion.div>
        <motion.div
          className="box"
          animate={{
            scale: [1, 1.1, 1.1, 1, 1],
            borderRadius: ["50%", "50%", "50%", "50%", "50%"],
            rotate: [180, 180, 360, 360, 0],
          }}
          transition={{
            duration: 4,
            yoyo: Infinity,
          }}
        >
          <img alt="circles-logo" src={circlesLogo} width="200" height="200" />
        </motion.div>
        <motion.div
          className="box"
          animate={{
            scale: [1, 1.1, 1.1, 1, 1],
            borderRadius: ["50%", "50%", "50%", "50%", "50%"],
            rotate: [0, 0, 360, 360, 0],
          }}
          transition={{
            duration: 4,
            yoyo: Infinity,
          }}
        >
          <img alt="circles-logo" src={circlesLogo} width="200" height="200" />
        </motion.div>
        <motion.div
          className="box"
          animate={{
            scale: [1, 1.1, 1.1, 1, 1],
            borderRadius: ["50%", "50%", "50%", "50%", "50%"],
            rotate: [180, 180, 360, 360, 0],
          }}
          transition={{
            duration: 4,
            yoyo: Infinity,
          }}
        >
          <img alt="circles-logo" src={circlesLogo} width="200" height="200" />
        </motion.div>
        <motion.div
          className="box"
          animate={{
            scale: [1, 1.1, 1.1, 1, 1],
            borderRadius: ["50%", "50%", "50%", "50%", "50%"],
            rotate: [0, 0, 360, 360, 0],
          }}
          transition={{
            duration: 4,
            yoyo: Infinity,
          }}
        >
          <img alt="circles-logo" src={circlesLogo} width="200" height="200" />
        </motion.div>
        <motion.div
          className="box"
          animate={{
            scale: [1, 1.1, 1.1, 1, 1],
            borderRadius: ["50%", "50%", "50%", "50%", "50%"],
            rotate: [180, 180, 360, 360, 0],
          }}
          transition={{
            duration: 4,
            yoyo: Infinity,
          }}
        >
          <img alt="circles-logo" src={circlesLogo} width="200" height="200" />
        </motion.div>
        <motion.div
          className="box"
          animate={{
            scale: [1, 1.1, 1.1, 1, 1],
            borderRadius: ["50%", "50%", "50%", "50%", "50%"],
            rotate: [0, 0, 360, 360, 0],
          }}
          transition={{
            duration: 4,
            yoyo: Infinity,
          }}
        >
          <img alt="circles-logo" src={circlesLogo} width="200" height="200" />
        </motion.div>
        <motion.div
          className="box"
          animate={{
            scale: [1, 1.1, 1.1, 1, 1],
            borderRadius: ["50%", "50%", "50%", "50%", "50%"],
            rotate: [180, 180, 360, 360, 0],
          }}
          transition={{
            duration: 4,
            yoyo: Infinity,
          }}
        >
          <img alt="circles-logo" src={circlesLogo} width="200" height="200" />
        </motion.div>
        <motion.div
          className="box"
          animate={{
            scale: [1, 1.1, 1.1, 1, 1],
            borderRadius: ["50%", "50%", "50%", "50%", "50%"],
            rotate: [0, 0, 360, 360, 0],
          }}
          transition={{
            duration: 4,
            yoyo: Infinity,
          }}
        >
          <img alt="circles-logo" src={circlesLogo} width="200" height="200" />
        </motion.div>
        <motion.div
          className="box"
          animate={{
            scale: [1, 1.1, 1.1, 1, 1],
            borderRadius: ["50%", "50%", "50%", "50%", "50%"],
            rotate: [180, 180, 360, 360, 0],
          }}
          transition={{
            duration: 4,
            yoyo: Infinity,
          }}
        >
          <img alt="circles-logo" src={circlesLogo} width="200" height="200" />
        </motion.div>
      </div>
      <div className="box-container" />
    </div>
    <div className="text404">
      <Title id="headd">404</Title>
      <Title level={2} id="page-text">PAGE NOT FOUND</Title>
    </div>
  </>
);

export default PageNotFound;
