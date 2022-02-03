import React, { Component } from 'react';
import Particles from "react-tsparticles";

const PurpleColours = ["#ffffff","#f9f0ff","#efdbff","#d3adf7","#b37feb","#9254de"]

class ParticleBackground extends Component {

  constructor(props) {
    super(props);

    this.particlesInit = this.particlesInit.bind(this);
    this.particlesLoaded = this.particlesLoaded.bind(this);
  }

  particlesInit(main) {

    // you can initialize the tsParticles instance (main) here, adding custom shapes or presets
  }

  particlesLoaded(container) {
  }

  render() {
    return (
        <Particles
                id="tsparticles"
                init={this.particlesInit}
                loaded={this.particlesLoaded}
                options={{
                    autoPlay: true,
                    background: {
                     color: {
                      value: "transparent"
                     },
                     image: "",
                     position: "",
                     repeat: "",
                     size: "",
                     opacity: 0
                    },
                    backgroundMask: {
                     composite: "destination-out",
                     cover: {
                      color: {
                       value: "#fff"
                      },
                      opacity: 1
                     },
                     enable: false
                    },
                    fullScreen: {
                     enable: true,
                     zIndex: -1
                    },
                    detectRetina: true,
                    duration: 0,
                    fpsLimit: 60,
                    interactivity: {
                     detectsOn: "window",
                     events: {
                      onClick: {
                       enable: false,
                       mode: []
                      },
                      onDiv: {
                       selectors: [],
                       enable: false,
                       mode: [],
                       type: "circle"
                      },
                      onHover: {
                       enable: false,
                       mode: "trail",
                       parallax: {
                        enable: false,
                        force: 2,
                        smooth: 10
                       }
                      },
                      resize: true
                     },
                     modes: {
                      attract: {
                       distance: 200,
                       duration: 0.4,
                       easing: "ease-out-quad",
                       factor: 1,
                       maxSpeed: 50,
                       speed: 1
                      },
                      bounce: {
                       distance: 200
                      },
                      bubble: {
                       distance: 400,
                       duration: 0.4
                      },
                      connect: {
                       distance: 80,
                       links: {
                        opacity: 0.5
                       },
                       radius: 150
                      },
                      grab: {
                       distance: 100,
                       links: {
                        blink: false,
                        consent: false,
                        opacity: 1
                       }
                      },
                      light: {
                       area: {
                        gradient: {
                         start: {
                          value: "#ffffff"
                         },
                         stop: {
                          value: "#000000"
                         }
                        },
                        radius: 5000
                       },
                       shadow: {
                        color: {
                         value: "#000000"
                        },
                        length: 2000
                       }
                      },
                      push: {
                       default: true,
                       groups: [],
                       quantity: 4
                      },
                      remove: {
                       quantity: 2
                      },
                      repulse: {
                       distance: 200,
                       duration: 0.4,
                       factor: 100,
                       speed: 1,
                       maxSpeed: 50,
                       easing: "ease-out-quad"
                      },
                      slow: {
                       factor: 3,
                       radius: 200
                      },
                      trail: {
                       delay: 0.005,
                       pauseOnStop: true,
                       quantity: 5,
                       particles: {
                        color: {
                         value: "#9254de",
                         animation: {
                          enable: true,
                          speed: 400,
                          sync: true
                         }
                        },
                        collisions: {
                         enable: false,
                         bounce: {
                          horizontal: {
                           random: {}
                          },
                          vertical: {
                           random: {}
                          }
                         },
                         overlap: {}
                        },
                        links: {
                         enable: false,
                         shadow: {},
                         triangles: {}
                        },
                        move: {
                         outModes: {
                          default: "destroy"
                         },
                         speed: 2,
                         angle: {},
                         attract: {
                          rotate: {}
                         },
                         distance: {},
                         gravity: {},
                         path: {
                          delay: {
                           random: {}
                          }
                         },
                         trail: {}
                        },
                        size: {
                         value: 5,
                         animation: {
                          enable: true,
                          speed: 5,
                          minimumValue: 1,
                          sync: true,
                          startValue: "min",
                          destroy: "max"
                         },
                         random: {}
                        },
                        bounce: {
                         horizontal: {
                          random: {}
                         },
                         vertical: {
                          random: {}
                         }
                        },
                        destroy: {
                         split: {
                          factor: {
                           random: {}
                          },
                          rate: {
                           random: {}
                          }
                         }
                        },
                        life: {
                         delay: {
                          random: {}
                         },
                         duration: {
                          random: {}
                         }
                        },
                        number: {
                         density: {}
                        },
                        opacity: {
                         animation: {},
                         random: {}
                        },
                        roll: {
                         darken: {},
                         enlighten: {}
                        },
                        rotate: {
                         animation: {}
                        },
                        shadow: {
                         offset: {}
                        },
                        shape: {},
                        stroke: {
                         color: {
                          value: PurpleColours,
                          animation: {
                           count: 0,
                           enable: false,
                           offset: {
                            max: 0,
                            min: 0
                           },
                           speed: 0,
                           sync: false
                          }
                         }
                        },
                        tilt: {
                         animation: {}
                        },
                        twinkle: {
                         lines: {},
                         particles: {}
                        },
                        wobble: {}
                       }
                      }
                     }
                    },
                    manualParticles: [],
                    motion: {
                     disable: false,
                     reduce: {
                      factor: 4,
                      value: true
                     }
                    },
                    particles: {
                     bounce: {
                      horizontal: {
                       random: {
                        enable: false,
                        minimumValue: 0.1
                       },
                       value: 1
                      },
                      vertical: {
                       random: {
                        enable: false,
                        minimumValue: 0.1
                       },
                       value: 1
                      }
                     },
                     collisions: {
                      bounce: {
                       horizontal: {
                        random: {
                         enable: false,
                         minimumValue: 0.1
                        },
                        value: 1
                       },
                       vertical: {
                        random: {
                         enable: false,
                         minimumValue: 0.1
                        },
                        value: 1
                       }
                      },
                      enable: true,
                      mode: "bounce",
                      overlap: {
                       enable: true,
                       retries: 0
                      }
                     },
                     color: {
                      value: PurpleColours,
                      animation: {
                       h: {
                        count: 0,
                        enable: false,
                        offset: 0,
                        speed: 1,
                        sync: true
                       },
                       s: {
                        count: 0,
                        enable: false,
                        offset: 0,
                        speed: 1,
                        sync: true
                       },
                       l: {
                        count: 0,
                        enable: false,
                        offset: 0,
                        speed: 0.5,
                        sync: true
                       }
                      }
                     },
                     destroy: {
                      mode: "none",
                      split: {
                       count: 1,
                       factor: {
                        random: {
                         enable: false,
                         minimumValue: 0
                        },
                        value: 3
                       },
                       rate: {
                        random: {
                         enable: false,
                         minimumValue: 0
                        },
                        value: {
                         min: 4,
                         max: 9
                        }
                       },
                       sizeOffset: true
                      }
                     },
                     groups: {},
                     life: {
                      count: 0,
                      delay: {
                       random: {
                        enable: false,
                        minimumValue: 0
                       },
                       value: 0,
                       sync: false
                      },
                      duration: {
                       random: {
                        enable: false,
                        minimumValue: 0.0001
                       },
                       value: 0,
                       sync: false
                      }
                     },
                     links: {
                      blink: false,
                      color: {
                       value: "random"
                      },
                      consent: false,
                      distance: 200,
                      enable: true,
                      frequency: 0.1,
                      opacity: 0.1,
                      shadow: {
                       blur: 5,
                       color: {
                        value: "#00ff00"
                       },
                       enable: false
                      },
                      triangles: {
                       enable: false,
                       frequency: 1
                      },
                      width: 1,
                      warp: false
                     },
                     move: {
                      angle: {
                       offset: 0,
                       value: 90
                      },
                      attract: {
                       distance: 200,
                       enable: false,
                       rotate: {
                        x: 3000,
                        y: 3000
                       }
                      },
                      decay: 0,
                      distance: {},
                      direction: "none",
                      drift: 0,
                      enable: true,
                      gravity: {
                       acceleration: 9.81,
                       enable: false,
                       inverse: false,
                       maxSpeed: 50
                      },
                      path: {
                       clamp: true,
                       delay: {
                        random: {
                         enable: false,
                         minimumValue: 0
                        },
                        value: 0
                       },
                       enable: false
                      },
                      outModes: {
                       default: "out",
                       bottom: "out",
                       left: "out",
                       right: "out",
                       top: "out"
                      },
                      random: false,
                      size: false,
                      speed: 2,
                      straight: false,
                      trail: {
                       enable: false,
                       length: 10,
                       fillColor: {
                        value: "#000000"
                       }
                      },
                      vibrate: false,
                      warp: false
                     },
                     number: {
                      density: {
                       enable: true,
                       area: 800,
                       factor: 1000
                      },
                      limit: 0,
                      value: 60
                     },
                     opacity: {
                      random: {
                       enable: true,
                       minimumValue: 0.3
                      },
                      value: {
                       min: 0.3,
                       max: 0.8
                      },
                      animation: {
                       count: 0,
                       enable: true,
                       speed: 0.2,
                       sync: false,
                       destroy: "none",
                       minimumValue: 0.1,
                       startValue: "random"
                      }
                     },
                     orbit: {
                      animation: {
                       count: 0,
                       enable: false,
                       speed: 1,
                       sync: false
                      },
                      enable: false,
                      opacity: 1,
                      rotation: {
                       random: {
                        enable: false,
                        minimumValue: 0
                       },
                       value: 45
                      },
                      width: 1
                     },
                     reduceDuplicates: false,
                     repulse: {
                      random: {
                       enable: false,
                       minimumValue: 0
                      },
                      value: 0,
                      enabled: false,
                      distance: 1,
                      duration: 1,
                      factor: 1,
                      speed: 1
                     },
                     roll: {
                      darken: {
                       enable: false,
                       value: 0
                      },
                      enable: false,
                      enlighten: {
                       enable: false,
                       value: 0
                      },
                      speed: 25
                     },
                     rotate: {
                      random: {
                       enable: false,
                       minimumValue: 0
                      },
                      value: 0,
                      animation: {
                       enable: false,
                       speed: 0,
                       sync: false
                      },
                      direction: "clockwise",
                      path: false
                     },
                     shadow: {
                      blur: 0,
                      color: {
                       value: "#000000"
                      },
                      enable: false,
                      offset: {
                       x: 0,
                       y: 0
                      }
                     },
                     shape: {
                      options: {
                       image: [
                        null
                       ],
                       images: [
                        null
                       ]
                      },
                      type: "circle"
                     },
                     size: {
                      random: {
                       enable: true,
                       minimumValue: 7
                      },
                      value: {
                       min: 1,
                       max: 3
                      },
                      animation: {
                       count: 0,
                       enable: true,
                       speed: 1,
                       sync: false,
                       destroy: "none",
                       minimumValue: 1,
                       startValue: "random"
                      }
                     },
                     stroke: {
                      width: 0,
                      color: {
                       value: "",
                       animation: {
                        h: {
                         count: 0,
                         enable: false,
                         offset: 0,
                         speed: 0,
                         sync: false
                        },
                        s: {
                         count: 0,
                         enable: false,
                         offset: 0,
                         speed: 1,
                         sync: true
                        },
                        l: {
                         count: 0,
                         enable: false,
                         offset: 0,
                         speed: 1,
                         sync: true
                        }
                       }
                      }
                     },
                     tilt: {
                      random: {
                       enable: false,
                       minimumValue: 0
                      },
                      value: 0,
                      animation: {
                       enable: false,
                       speed: 0,
                       sync: false
                      },
                      direction: "clockwise",
                      enable: false
                     },
                     twinkle: {
                      lines: {
                       enable: false,
                       frequency: 0.05,
                       opacity: 1
                      },
                      particles: {
                       enable: false,
                       frequency: 0.05,
                       opacity: 1
                      }
                     },
                     wobble: {
                      distance: 5,
                      enable: false,
                      speed: 50
                     },
                     zIndex: {
                      random: {
                       enable: false,
                       minimumValue: 0
                      },
                      value: 0,
                      opacityRate: 1,
                      sizeRate: 1,
                      velocityRate: 1
                     }
                    },
                    pauseOnBlur: true,
                    pauseOnOutsideViewport: true,
                    responsive: [],
                    themes: []
                   }}
        />
    );
  }
}

export default ParticleBackground;