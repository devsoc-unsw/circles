import React from "react";

import { Card, Progress, Typography, Tag, Button } from "antd";

function TermPlanner() {
  const { Title, Text } = Typography;

  return (
    <div class="gridContainer">
      <div class="gridItem"></div>
      <div class="gridItem">Term 1</div>
      <div class="gridItem">Term 2</div>
      <div class="gridItem">Term 3</div>

      <div class="gridItem">2021</div>
      <div class="termBubble">
        <div className="course">
          COMP3333: Extended algorithms and programming techniques
        </div>
        <div className="course">
          ARTS4268: Methodologies in the Social Sciences: Questions and
          Quandaries
        </div>
        <div className="course">COMP1511: Programming Fundamentals</div>
      </div>
      <div class="termBubble">
        <div className="course">
          COMP3333: Extended algorithms and programming techniques
        </div>
      </div>
      <div class="termBubble"></div>

      <div class="gridItem">2022</div>
      <div class="termBubble"></div>
      <div class="termBubble"></div>
      <div class="termBubble"></div>
    </div>
  );
}

export default TermPlanner;
