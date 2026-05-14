import React, { useState, useRef } from "react";
import { toSvg, toPng } from "html-to-image";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import download from "downloadjs";
import { Step, StepLabel, Stepper, Button, Typography } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import CartDropdown from "./CartDropDown";
import { Upload, FileImage, Move, RotateCcw, Trash2 } from 'lucide-react';

const steps = [
  "Model",
  "Material",
  "Size",
  "Accessories",
  "Icons",
  "Panel",
  "Frame",
  "Cart",
];
const currentSelectedModule = {
  model: null,
  material: null,
  size: null,
  accessories: [],
  icons: [],
  panel: null,
  frame: null,
};

const moduleOptions = [
  {
    label: "2 module",
    image: "https://via.placeholder.com/300?text=2+module",
    className: "module-display module-2 module-black",
    subclassName: "sub-module-2",
    maxNodeSize: 2,
  },
  {
    label: "4 module",
    image: "https://via.placeholder.com/300?text=4+module",
    className: "module-display module-4 module-black",
    subclassName: "sub-module-4",
    maxNodeSize: 4,
  },
  {
    label: "6 module",
    image: "https://via.placeholder.com/300?text=6+module",
    className: "module-display module-6 module-black",
    subclassName: "sub-module-6",
    maxNodeSize: 6,
  },
  {
    label: "8 module",
    image: "https://via.placeholder.com/300?text=8+module",
    className: "module-display module-8 module-black",
    subclassName: "sub-module-8",
    maxNodeSize: 8,
  },
  {
    label: "12 module",
    image: "https://via.placeholder.com/300?text=12+module",
    className: "module-display module-12 module-black",
    subclassName: "sub-module-12",
    maxNodeSize: 6,
  },
];

const colors = [
  { code: "#000000", label: "Black", tronixFlag: true },
  { code: "#000000", label: "Black" },
  { code: "#bfc6cb", label: "Space Grey" },
  { code: "#f4debe", label: "Titanium" },
  { code: "#ffffff", label: "White", tronixFlag: true },
  { code: "#616161", label: "Gray", tronixFlag: true }
];

const accessories = {
  "2 module": [
    {
      name: "2 Switch(1-25A)",
      tronixFlag: true,
      nodeSize: 1,
      className: "switch",
      nodes: [
        {
          noIcon: false,
          nodeClasses: [
            "switch2Image switch2Imagesubnode1",
            "switch2Image switch2Imagesubnode2",
          ],
        },
      ],
    },
    {
      name: "4 Switch",
      tronixFlag: true,
      nodeSize: 2,
      className: "scene4",
      nodes: [
        {
          noIcon: false,
          nodeClasses: [
            "switch2Image scene4-1subnode1",
            "switch2Image scene4-1subnode2",
          ],
        },
        {
          noIcon: false,
          nodeClasses: [
            "switch2Image scene4-2subnode1",
            "switch2Image scene4-2subnode2",
          ],
        },
      ],
    },
    {
      name: 'Fan',
      tronixFlag: true,
      nodeSize: 2,
      className:'switch',
      noIcon: true,
      nodes: [
        {
          noIcon: true,
          nodeClasses:
          ['switch2ImageDimmer']
        },
        {
          noIcon: false,
          nodeClasses:
          ['switch2ImageFan switch2ImageFansubnode1']
        }
      ]
    },
    {
      name: "2 Switch 1 Curtain",
      nodeSize: 2,
      className: "scene4",
      nodes: [
        {
          noIcon: false,
          nodeClasses: [
            "switch2Image scene4-1subnode1",
            "switch2Image scene4-1subnode2",
          ],
        },
        {
          noIcon: false,
          nodeClasses: [
            "curtain1Image scene4-1subnode1",
            "curtain2Image scene4-1subnode2",
          ],
          // nodeClasses: [
          //   "curtainImage",
          // ],
        },
      ],
    },
    {
      name: "1 Curtain",
      nodeSize: 2,
      className: "switch",
      noIcon: true,
      
      nodes: [{ noIcon: false, 
        // nodeClasses: ["curtainImage alignRight"]
        nodeClasses: [
          "curtain1Image scene4-1subnode1",
          "curtain2Image scene4-1subnode2",
        ],
       }],
    },
    // {name: 'Curtain', nodeSize: 1, className:'switch', nodes: [{nodeClasses:['curtainImage']}]},
    {
      name: "Socket 10A",
      nodeSize: 2,
      className: "switch",
      noIcon: true,
      nodes: [{ noIcon: true, nodeClasses: ["sixampImage"] }],
    },
    {
      name: "Socket 16A",
      nodeSize: 2,
      className: "switch",
      noIcon: true,
      nodes: [{ noIcon: true, nodeClasses: ["socket16amp"] }],
    },
  ],
  "4 module": [
    {
      name: "4 Switch",
      nodeSize: 2,
      className: "scene4",
      nodes: [
        {
          noIcon: false,
          nodeClasses: [
            "switch2Image scene4-1subnode1",
            "switch2Image scene4-1subnode2",
          ],
        },
        {
          noIcon: false,
          nodeClasses: [
            "switch2Image scene4-2subnode1",
            "switch2Image scene4-2subnode2",
          ],
        },
      ],
    },
    {
      name: "2 Switch(1 25A)  1 Socket(1 10A)",
      nodeSize: 3,
      className: "scene4",
      nodes: [
        {
          noIcon: false,
          nodeClasses: [
            "scene4f-rightsubnode1 switch2Image scene4f-1subnode1 ",
            "scene4f-rightsubnode1 switch2Image scene4f-1subnode2",
          ],
        },
        { noIcon: true, nodeClasses: ["scene4f-rightsubnode1 sixampImage"] },
      ],
    },
    {
      name: "2 Switch  1 Fan(1 25A)",
      nodeSize: 3,
      className: "scene4",
      nodes: [
        {
          noIcon: false,
          nodeClasses: [
            "switch2Image scene4f-1subnode1",
            "switch2Image scene4f-1subnode2",
          ],
        },
        { noIcon: true, nodeClasses: ["switch2ImageDimmer scene4f-subnoded"] },
        {
          noIcon: false,
          nodeClasses: [
            "switch2ImageFan switch2ImageFansubnode1 scene4f-subnodef",
          ],
        }
      ],
    },
    {
      name: "4 Switch (1-25A) 1 Curtain",
      nodeSize: 3,
      className: "scene4",
      nodes: [
        {
          noIcon: false,
          nodeClasses: [
            "switch2Image scene4f-1subnode1",
            "switch2Image scene4f-1subnode2",
          ],
        },
        {
          noIcon: false,
          nodeClasses: [
            "switch2Image scene4f-2subnode1",
            "switch2Image scene4f-2subnode2",
          ],
        },
        { noIcon: false,  nodeClasses: [
          "curtain1Image scene4-1subnode1",
          "curtain2Image scene4-1subnode2",
        ], },
      ],
    },
    {
      name: "6 Switch (1-25A) 1 Curtain",
      nodeSize: 4,
      className: "scene4",
      nodes: [
        {
          noIcon: false,
          nodeClasses: [
            "switch2Image scene6-1subnode1",
            "switch2Image scene6-1subnode2",
          ],
        },
        {
          noIcon: false,
          nodeClasses: [
            "switch2Image scene6-2subnode1",
            "switch2Image scene6-2subnode2",
          ],
        },
        {
          noIcon: false,
          nodeClasses: [
            "switch2Image scene6-3subnode1",
            "switch2Image scene6-3subnode2",
          ],
        },
        { noIcon: false,  nodeClasses: [
          "curtain1Image scene4-1subnode1",
          "curtain2Image scene4-1subnode2",
        ], },
      ],
    },
    {
      name: "4 Switch 1Socket (1-10A)",
      nodeSize: 4,
      className: "scene4",
      nodes: [
        {
          noIcon: false,
          nodeClasses: [
            "switch2Image scene4f-1subnode1",
            "switch2Image scene4f-1subnode2",
          ],
        },
        {
          noIcon: false,
          nodeClasses: [
            "switch2Image scene4f-2subnode1",
            "switch2Image scene4f-2subnode2",
          ],
        },
        {
          noIcon: true,
          nodeClasses: [
            "sixampImage",
          ],
        },
      ],
    },
    {
      name: "Fan 1Socket (1-10A)",
      nodeSize: 4,
      className: "scene4",
      nodes: [
        { noIcon: true, nodeClasses: ["switch2ImageDimmer"] },
        {
          noIcon: false,
          nodeClasses: [
            "switch2ImageFan switch2ImageFansubnode1",
          ],
        },
        {
          noIcon: true,
          nodeClasses: [
            "sixampImage",
          ],
        },
      ],
    },
    {
      name: "2 Switch 1 Fan 1 Curtain",
      nodeSize: 4,
      className: "scene4",
      nodes: [
        {
          noIcon: false,
          nodeClasses: [
            "switch2Image scene4f-1subnode1",
            "switch2Image scene4f-1subnode2",
          ],
        },
        { noIcon: true, nodeClasses: ["switch2ImageDimmer"] },
        {
         noIcon: false,
          nodeClasses: [
            "switch2ImageFan switch2ImageFansubnode1",
          ],
        },
        { noIcon: false,  nodeClasses: [
          "curtain1Image scene4-1subnode1",
          "curtain2Image scene4-1subnode2",
        ], },
      ],
    },
    {
      name: "4 Switch + 1 Fan",
      tronixFlag: true,
      nodeSize: 4,
      className: "scene4",
      nodes: [
        {
          noIcon: false,
          nodeClasses: [
            "switch2Image scene4f-1subnode1",
            "switch2Image scene4f-1subnode2",
          ],
        },
        {
          noIcon: false,
          nodeClasses: [
            "switch2Image scene4f-2subnode1",
            "switch2Image scene4f-2subnode2",
          ],
        },
        { noIcon: true, nodeClasses: ["switch2ImageDimmer scene4f-subnodef"] },
        {
          noIcon: false,
          nodeClasses: [
            "switch2ImageFan switch2ImageFansubnode1",
          ],
        },
      ],
    },
    {
      name: "2 Fan",
      nodeSize: 4,
      className: "scene4",
      nodes: [
        { noIcon: true, nodeClasses: ["switch2ImageDimmer"] },
        {
         noIcon: false,
          nodeClasses: [
            "switch2ImageFan switch2ImageFansubnode1",
          ],
        },
        { noIcon: true, nodeClasses: ["switch2ImageDimmer"] },
        {
         noIcon: false,
          nodeClasses: [
            "switch2ImageFan switch2ImageFansubnode1",
          ],
        },
      ],
    },
    {
      name: "6 Switch(1 20A)",
      nodeSize: 3,
      className: "scene4",
      nodes: [
        {
          noIcon: false,
          nodeClasses: [
            "switch2Image scene6-1subnode1",
            "switch2Image scene6-1subnode2",
          ],
        },
        {
          noIcon: false,
          nodeClasses: [
            "switch2Image scene6-2subnode1",
            "switch2Image scene6-2subnode2",
          ],
        },
        {
          noIcon: false,
          nodeClasses: [
            "switch2Image scene6-3subnode1",
            "switch2Image scene6-3subnode2",
          ],
        },
      ],
    },
    {
      name: "8 Switch(1 20A)",
      tronixFlag: true,
      nodeSize: 4,
      className: "scene6",
      nodes: [
        {
          noIcon: false,
          nodeClasses: [
            "switch2Image scene610-1subnode1",
            "switch2Image scene610-1subnode2",
          ],
        },
        {
          noIcon: false,
          nodeClasses: [
            "switch2Image scene610-2subnode1",
            "switch2Image scene610-2subnode2",
          ],
        },
        {
          noIcon: false,
          nodeClasses: [
            "switch2Image scene610-3subnode1",
            "switch2Image scene610-3subnode2",
          ],
        },
        {
          noIcon: false,
          nodeClasses: [
            "switch2Image scene610-4subnode1",
            "switch2Image scene610-4subnode2",
          ],
        },
      ],
    }
  ],
  "6 module": [
    {
      name: "6 Switch(1 20A)",
      nodeSize: 3,
      className: "scene4",
      nodes: [
        {
          noIcon: false,
          nodeClasses: [
            "switch2Image scene6-1subnode1",
            "switch2Image scene6-1subnode2",
          ],
        },
        {
          noIcon: false,
          nodeClasses: [
            "switch2Image scene6-2subnode1",
            "switch2Image scene6-2subnode2",
          ],
        },
        {
          noIcon: false,
          nodeClasses: [
            "switch2Image scene6-3subnode1",
            "switch2Image scene6-3subnode2",
          ],
        },
      ],
    },
    {
      name: "8 Switch(1 20A)",
      nodeSize: 4,
      className: "scene6",
      nodes: [
        {
          noIcon: false,
          nodeClasses: [
            "switch2Image scene610-1subnode1",
            "switch2Image scene610-1subnode2",
          ],
        },
        {
          noIcon: false,
          nodeClasses: [
            "switch2Image scene610-2subnode1",
            "switch2Image scene610-2subnode2",
          ],
        },
        {
          noIcon: false,
          nodeClasses: [
            "switch2Image scene610-3subnode1",
            "switch2Image scene610-3subnode2",
          ],
        },
        {
          noIcon: false,
          nodeClasses: [
            "switch2Image scene610-4subnode1",
            "switch2Image scene610-4subnode2",
          ],
        },
      ],
    },
    {
      name: "10 Switch(2 20A)",
      nodeSize: 5,
      className: "scene6",
      nodes: [
        {
          noIcon: false,
          nodeClasses: [
            "switch2Image scene610-1subnode1",
            "switch2Image scene610-1subnode2",
          ],
        },
        {
          noIcon: false,
          nodeClasses: [
            "switch2Image scene610-2subnode1",
            "switch2Image scene610-2subnode2",
          ],
        },
        {
          noIcon: false,
          nodeClasses: [
            "switch2Image scene610-3subnode1",
            "switch2Image scene610-3subnode2",
          ],
        },
        {
          noIcon: false,
          nodeClasses: [
            "switch2Image scene610-4subnode1",
            "switch2Image scene610-4subnode2",
          ],
        },
        {
          noIcon: false,
          nodeClasses: [
            "switch2Image scene610-5subnode1",
            "switch2Image scene610-5subnode2",
          ],
        },
      ],
    },
    {
      name: "6 Switch (1-25A) 1 Fan",
      nodeSize: 5,
      className: "scene6",
      nodes: [
        {
          noIcon: false,
          nodeClasses: [
            "switch2Image scene610-1subnode1",
            "switch2Image scene610-1subnode2",
          ],
        },
        {
          noIcon: false,
          nodeClasses: [
            "switch2Image scene610-2subnode1",
            "switch2Image scene610-2subnode2",
          ],
        },
        {
          noIcon: false,
          nodeClasses: [
            "switch2Image scene610-3subnode1",
            "switch2Image scene610-3subnode2",
          ],
        },
        { noIcon: true, nodeClasses: ["switch2ImageDimmer"] },
        {
          noIcon: false,
          nodeClasses: [
            "switch2ImageFan switch2ImageFansubnode1",
          ],
        },
      ],
    },
    {
      name: "8 Switch (1-20A) 1 Fan",
      nodeSize: 6,
      className: "scene6",
      nodes: [
        {
          noIcon: false,
          nodeClasses: [
            "switch2Image scene610-1subnode1",
            "switch2Image scene610-1subnode2",
          ],
        },
        {
          noIcon: false,
          nodeClasses: [
            "switch2Image scene610-2subnode1",
            "switch2Image scene610-2subnode2",
          ],
        },
        {
          noIcon: false,
          nodeClasses: [
            "switch2Image scene610-3subnode1",
            "switch2Image scene610-3subnode2",
          ],
        },
        {
          noIcon: false,
          nodeClasses: [
            "switch2Image scene610-4subnode1",
            "switch2Image scene610-4subnode2",
          ],
        },
        { noIcon: true, nodeClasses: ["switch2ImageDimmer"] },
        {
          noIcon: false,
          nodeClasses: [
            "switch2ImageFan switch2ImageFansubnode1",
          ],
        },
      ],
    },
    {
      name: "2 Switch (1-25A) 1 Fan 1 Socket (1-10A)",
      nodeSize: 5,
      className: "scene6",
      nodes: [
        {
          noIcon: false,
          nodeClasses: [
            "switch2Image scene610-1subnode1",
            "switch2Image scene610-1subnode2",
          ],
        },
        { noIcon: true, nodeClasses: ["switch2ImageDimmer"] },
        {
          noIcon: false,
          nodeClasses: [
            "switch2ImageFan switch2ImageFansubnode1",
          ],
        },
        { noIcon: true, nodeClasses: ["sixampImage"] }
      ],
    },
    {
      name: "6 Switch (1-25A) 1 Socket (1-10A)",
      nodeSize: 5,
      className: "scene6",
      nodes: [
        {
          noIcon: false,
          nodeClasses: [
            "switch2Image scene610-1subnode1",
            "switch2Image scene610-1subnode2",
          ],
        },
        {
          noIcon: false,
          nodeClasses: [
            "switch2Image scene610-2subnode1",
            "switch2Image scene610-2subnode2",
          ],
        },
        {
          noIcon: false,
          nodeClasses: [
            "switch2Image scene610-3subnode1",
            "switch2Image scene610-3subnode2",
          ],
        },
        { noIcon: true, nodeClasses: ["sixampImage right6-3"] }
      ],
    },
    {
      name: "2 Switch (1-25A) 2 Socket (2-10A)",
      nodeSize: 5,
      className: "scene6",
      nodes: [
        {
          noIcon: false,
          nodeClasses: [
            "switch2Image scene610-1subnode1 left6",
            "switch2Image scene610-1subnode2 left6",
          ],
        },
        { noIcon: true, nodeClasses: ["sixampImage"] },
        { noIcon: true, nodeClasses: ["sixampImage right6-1"] }
      ],
    },
    {
      name: "8 Switch (2-25A) 1 Curtain",
      nodeSize: 5,
      className: "scene6",
      nodes: [
        {
          noIcon: false,
          nodeClasses: [
            "switch2Image scene610-1subnode1",
            "switch2Image scene610-1subnode2",
          ],
        },
        {
          noIcon: false,
          nodeClasses: [
            "switch2Image scene610-2subnode1",
            "switch2Image scene610-2subnode2",
          ],
        },
        {
          noIcon: false,
          nodeClasses: [
            "switch2Image scene610-3subnode1",
            "switch2Image scene610-3subnode2",
          ],
        },
        {
          noIcon: false,
          nodeClasses: [
            "switch2Image scene610-4subnode1",
            "switch2Image scene610-4subnode2",
          ],
        },
        {
          noIcon: false,
          nodeClasses: [
            "curtain1Image scene4-1subnode1",
            "curtain2Image scene4-1subnode2",
          ],
        },
      ],
    },
    {
      name: "4 Switch (1-25A) 1 Fan 1 Curtain",
      nodeSize: 5,
      className: "scene6",
      nodes: [
        {
          noIcon: false,
          nodeClasses: [
            "switch2Image scene610-1subnode1",
            "switch2Image scene610-1subnode2",
          ],
        },
        {
          noIcon: false,
          nodeClasses: [
            "switch2Image scene610-2subnode1",
            "switch2Image scene610-2subnode2",
          ],
        },
        { noIcon: true, nodeClasses: ["switch2ImageDimmer"] },
        {
         noIcon: false,
          nodeClasses: [
            "switch2ImageFan switch2ImageFansubnode1",
          ],
        },
        { noIcon: false,  nodeClasses: [
          "curtain1Image scene4-1subnode1",
          "curtain2Image scene4-1subnode2",
        ], },
      ],
    },
    {
      name: "4 Switch + 2 Fan",
      nodeSize: 6,
      className: "scene6",
      nodes: [
        {
          noIcon: false,
          nodeClasses: [
            "switch2Image scene4f-1subnode1",
            "switch2Image scene4f-1subnode2",
          ],
        },
        {
          noIcon: false,
          nodeClasses: [
            "switch2Image scene4f-2subnode1",
            "switch2Image scene4f-2subnode2",
          ],
        },
        { noIcon: true, nodeClasses: ["switch2ImageDimmer scene4f-subnoded"] },
        {
         noIcon: false,
          nodeClasses: [
            "switch2ImageFan switch2ImageFansubnode1 scene4f-subnodef",
          ],
        },
        { noIcon: true, nodeClasses: ["switch2ImageDimmer scene4f-subnoded"] },
        {
          noIcon: false,
          nodeClasses: [
            "switch2ImageFan switch2ImageFansubnode1 scene4f-subnodef",
          ],
        },
      ],
    },
    {
      name: "4 Switch 1 Fan 1 Socket (1-10A)",
      tronixFlag: true,
      nodeSize: 6,
      className: "scene6",
      nodes: [
        {
          noIcon: false,
          nodeClasses: [
            "switch2Image scene4f-1subnode1",
            "switch2Image scene4f-1subnode2",
          ],
        },
        {
          noIcon: false,
          nodeClasses: [
            "switch2Image scene4f-2subnode1",
            "switch2Image scene4f-2subnode2",
          ],
        },
        { noIcon: true, nodeClasses: ["switch2ImageDimmer "] },
        {
          noIcon: false,
          nodeClasses: [
            "switch2ImageFan switch2ImageFansubnode1",
          ],
        },
        { noIcon: true, nodeClasses: ["sixampImage"] }
      ],
    },
    {
      name: "8 Switch (1-20A) 1 Socket (1-10A)",
      tronixFlag: true,
      nodeSize: 6,
      className: "scene6",
      nodes: [
        {
          noIcon: false,
          nodeClasses: [
            "switch2Image scene610-1subnode1",
            "switch2Image scene610-1subnode2",
          ],
        },
        {
          noIcon: false,
          nodeClasses: [
            "switch2Image scene610-2subnode1",
            "switch2Image scene610-2subnode2",
          ],
        },
        {
          noIcon: false,
          nodeClasses: [
            "switch2Image scene610-3subnode1",
            "switch2Image scene610-3subnode2",
          ],
        },
        {
          noIcon: false,
          nodeClasses: [
            "switch2Image scene610-4subnode1",
            "switch2Image scene610-4subnode2",
          ],
        },
        { noIcon: true, nodeClasses: ["sixampImage"] }
      ],
    },
    {
      name: "4 Switch 2 Socket (2-10A)",
      nodeSize: 6,
      className: "scene6",
      nodes: [
        {
          noIcon: false,
          nodeClasses: [
            "switch2Image scene4f-1subnode1",
            "switch2Image scene4f-1subnode2",
          ],
        },
        {
          noIcon: false,
          nodeClasses: [
            "switch2Image scene4f-2subnode1",
            "switch2Image scene4f-2subnode2",
          ],
        },
        { noIcon: true, nodeClasses: ["sixampImage"] }, 
        { noIcon: true, nodeClasses: ["sixampImage  right6-2"] }
      ],
    },
    {
      name: "6 Switch (1-25A) 1 Socket (1-10A) 1 Curtain",
      nodeSize: 6,
      className: "scene6",
      nodes: [
        {
          noIcon: false,
          nodeClasses: [
            "switch2Image scene610-1subnode1",
            "switch2Image scene610-1subnode2",
          ],
        },
        {
          noIcon: false,
          nodeClasses: [
            "switch2Image scene610-2subnode1",
            "switch2Image scene610-2subnode2",
          ],
        },
        {
          noIcon: false,
          nodeClasses: [
            "switch2Image scene610-3subnode1",
            "switch2Image scene610-3subnode2",
          ],
        },
        { noIcon: true, nodeClasses: ["sixampImage"] }, 
        { noIcon: true, nodeClasses: ["curtainImage"] }, 
      ],
    },
  ],
  "8 module": [
    {
      name: "8 Switch (1-20A) 1 Fan",
      nodeSize: 6,
      className: "scene6",
      nodes: [
        {
          noIcon: false,
          nodeClasses: [
            "switch2Image scene610-1subnode1",
            "switch2Image scene610-1subnode2",
          ],
        },
        {
          noIcon: false,
          nodeClasses: [
            "switch2Image scene610-2subnode1",
            "switch2Image scene610-2subnode2",
          ],
        },
        {
          noIcon: false,
          nodeClasses: [
            "switch2Image scene610-3subnode1",
            "switch2Image scene610-3subnode2",
          ],
        },
        {
          noIcon: false,
          nodeClasses: [
            "switch2Image scene610-4subnode1",
            "switch2Image scene610-4subnode2",
          ],
        },
        { noIcon: true, nodeClasses: ["switch2ImageDimmer"] },
        {
          noIcon: false,
          nodeClasses: [
            "switch2ImageFan switch2ImageFansubnode1",
          ],
        },
      ],
    },
    {
      name: " 4 Switch 2 Fan 1 Socket (1-10A)",
      nodeSize: 8,
      className: "scene6",
      nodes: [
        {
          noIcon: false,
          nodeClasses: [
            "switch2Image scene610-1subnode1",
            "switch2Image scene610-1subnode2",
          ],
        },
        {
          noIcon: false,
          nodeClasses: [
            "switch2Image scene610-2subnode1",
            "switch2Image scene610-2subnode2",
          ],
        },
        { noIcon: true, nodeClasses: ["switch2ImageDimmer"] },
        {
          noIcon: false,
          nodeClasses: [
            "switch2ImageFan switch2ImageFansubnode1",
          ],
        },
        { noIcon: true, nodeClasses: ["switch2ImageDimmer"] },
        {
          noIcon: false,
          nodeClasses: [
            "switch2ImageFan switch2ImageFansubnode1",
          ],
        },
        { noIcon: true, nodeClasses: ["sixampImage alignRight3"] }, 
      ],
    },
    {
      name: "6 Switch (1-25A) 1 Fan 1 Socket (1-10A)",
      tronixFlag: true,
      nodeSize: 7,
      className: "scene6",
      nodes: [
        {
          noIcon: false,
          nodeClasses: [
            "switch2Image scene610-1subnode1",
            "switch2Image scene610-1subnode2",
          ],
        },
        {
          noIcon: false,
          nodeClasses: [
            "switch2Image scene610-2subnode1",
            "switch2Image scene610-2subnode2",
          ],
        },
        {
          noIcon: false,
          nodeClasses: [
            "switch2Image scene610-3subnode1",
            "switch2Image scene610-3subnode2",
          ],
        },
        { noIcon: true, nodeClasses: ["switch2ImageDimmer"] },
        {
          noIcon: false,
          nodeClasses: [
            "switch2ImageFan switch2ImageFansubnode1",
          ],
        },
        { noIcon: true, nodeClasses: ["sixampImage "] }, 
      ],
    },
    {
      name: "8 Switch (2-20A) 1 Fan 1 Socket (1-10A)",
      nodeSize: 7,
      className: "scene6",
      nodes: [
        {
          noIcon: false,
          nodeClasses: [
            "switch2Image scene610-1subnode1",
            "switch2Image scene610-1subnode2",
          ],
        },
        {
          noIcon: false,
          nodeClasses: [
            "switch2Image scene610-2subnode1",
            "switch2Image scene610-2subnode2",
          ],
        },
        {
          noIcon: false,
          nodeClasses: [
            "switch2Image scene610-3subnode1",
            "switch2Image scene610-3subnode2",
          ],
        },
        {
          noIcon: false,
          nodeClasses: [
            "switch2Image scene610-4subnode1",
            "switch2Image scene610-4subnode2",
          ],
        },
        { noIcon: true, nodeClasses: ["switch2ImageDimmer"] },
        {
          noIcon: false,
          nodeClasses: [
            "switch2ImageFan switch2ImageFansubnode1",
          ],
        },
        { noIcon: true, nodeClasses: ["sixampImage rightsubnode1"] }, 
      ],
    },
    {
      name: "8 Switch (2-20A) 1 Curtain 1 Socket (1-10A)",
      nodeSize: 7,
      className: "scene6",
      nodes: [
        {
          noIcon: false,
          nodeClasses: [
            "switch2Image scene610-1subnode1",
            "switch2Image scene610-1subnode2",
          ],
        },
        {
          noIcon: false,
          nodeClasses: [
            "switch2Image scene610-2subnode1",
            "switch2Image scene610-2subnode2",
          ],
        },
        {
          noIcon: false,
          nodeClasses: [
            "switch2Image scene610-3subnode1",
            "switch2Image scene610-3subnode2",
          ],
        },
        {
          noIcon: false,
          nodeClasses: [
            "switch2Image scene610-4subnode1",
            "switch2Image scene610-4subnode2",
          ],
        },
        { noIcon: false,  nodeClasses: [
          "curtain1Image scene4-1subnode1",
          "curtain2Image scene4-1subnode2",
        ],}, 
        { noIcon: true, nodeClasses: ["sixampImage rightsubnode1"] }, 
      ],
    },
    {
      name: "4 Switch (1-25A) 1 Fan 1 Curtain 1 Socket (1-10A)",
      nodeSize: 7,
      className: "scene6",
      nodes: [
        {
          noIcon: false,
          nodeClasses: [
            "switch2Image scene610-1subnode1",
            "switch2Image scene610-1subnode2",
          ],
        },
        {
          noIcon: false,
          nodeClasses: [
            "switch2Image scene610-2subnode1",
            "switch2Image scene610-2subnode2",
          ],
        },
        { noIcon: true, nodeClasses: ["switch2ImageDimmer"] },
        {
          noIcon: false,
          nodeClasses: [
            "switch2ImageFan switch2ImageFansubnode1",
          ],
        },
        { noIcon: false,  nodeClasses: [
          "curtain1Image scene4-1subnode1",
          "curtain2Image scene4-1subnode2",
        ], }, 
        { noIcon: true, nodeClasses: ["sixampImage"] },
      ],
    },
    {
      name: "8 Switch (2-20A) 1 Socket (1-10A)",
      tronixFlag: true,
      nodeSize: 7,
      className: "scene6",
      nodes: [
        {
          noIcon: false,
          nodeClasses: [
            "switch2Image scene610-1subnode1",
            "switch2Image scene610-1subnode2",
          ],
        },
        {
          noIcon: false,
          nodeClasses: [
            "switch2Image scene610-2subnode1",
            "switch2Image scene610-2subnode2",
          ],
        },
        {
          noIcon: false,
          nodeClasses: [
            "switch2Image scene610-3subnode1",
            "switch2Image scene610-3subnode2",
          ],
        },
        {
          noIcon: false,
          nodeClasses: [
            "switch2Image scene610-4subnode1",
            "switch2Image scene610-4subnode2",
          ],
        },
        { noIcon: true, nodeClasses: ["sixampImage rightsubnode1"] }, 
      ],
    },
    {
      name: "10 Switch (2-20A) 1 Socket (1-10A)",
      nodeSize: 7,
      className: "scene6",
      nodes: [
        {
          noIcon: false,
          nodeClasses: [
            "switch2Image scene610-1subnode1",
            "switch2Image scene610-1subnode2",
          ],
        },
        {
          noIcon: false,
          nodeClasses: [
            "switch2Image scene610-2subnode1",
            "switch2Image scene610-2subnode2",
          ],
        },
        {
          noIcon: false,
          nodeClasses: [
            "switch2Image scene610-3subnode1",
            "switch2Image scene610-3subnode2",
          ],
        },
        {
          noIcon: false,
          nodeClasses: [
            "switch2Image scene610-4subnode1",
            "switch2Image scene610-4subnode2",
          ],
        },
        {
          noIcon: false,
          nodeClasses: [
            "switch2Image scene610-5subnode1",
            "switch2Image scene610-5subnode2",
          ],
        },
        { noIcon: true, nodeClasses: ["sixampImage scene4f-rightsubnode1"] },
      ],
    },
    {
      name: "4 Switch + 2 Fan",
      nodeSize: 6,
      className: "scene6",
      nodes: [
        {
          noIcon: false,
          nodeClasses: [
            "switch2Image scene4f-1subnode1",
            "switch2Image scene4f-1subnode2",
          ],
        },
        {
          noIcon: false,
          nodeClasses: [
            "switch2Image scene4f-2subnode1",
            "switch2Image scene4f-2subnode2",
          ],
        },
        { noIcon: true, nodeClasses: ["switch2ImageDimmer scene4f-subnodef"] },
        {
         noIcon: false,
          nodeClasses: [
            "switch2ImageFan switch2ImageFansubnode1 scene4f-subnoded",
          ],
        },
        { noIcon: true, nodeClasses: ["switch2ImageDimmer scene4f-subnodef"] },
        {
          noIcon: false,
          nodeClasses: [
            "switch2ImageFan switch2ImageFansubnode1 scene4f-subnoded",
          ],
        },
      ],
    },
    {
      name: "6 Switch (1-25A) 1 Fan",
      nodeSize: 5,
      className: "scene6",
      nodes: [
        {
          noIcon: false,
          nodeClasses: [
            "switch2Image scene610-1subnode1",
            "switch2Image scene610-1subnode2",
          ],
        },
        {
          noIcon: false,
          nodeClasses: [
            "switch2Image scene610-2subnode1",
            "switch2Image scene610-2subnode2",
          ],
        },
        {
          noIcon: false,
          nodeClasses: [
            "switch2Image scene610-3subnode1",
            "switch2Image scene610-3subnode2",
          ],
        },
        { noIcon: true, nodeClasses: ["switch2ImageDimmer scene4f-subnodef"] },
        {
          noIcon: false,
          nodeClasses: [
            "switch2ImageFan switch2ImageFansubnode1 scene4f-subnoded",
          ],
        },
      ],
    },
    {
      name: "10 Switch(2 20A)",
      nodeSize: 5,
      className: "scene6",
      nodes: [
        {
          noIcon: false,
          nodeClasses: [
            "switch2Image scene610-1subnode1",
            "switch2Image scene610-1subnode2",
          ],
        },
        {
          noIcon: false,
          nodeClasses: [
            "switch2Image scene610-2subnode1",
            "switch2Image scene610-2subnode2",
          ],
        },
        {
          noIcon: false,
          nodeClasses: [
            "switch2Image scene610-3subnode1",
            "switch2Image scene610-3subnode2",
          ],
        },
        {
          noIcon: false,
          nodeClasses: [
            "switch2Image scene610-4subnode1",
            "switch2Image scene610-4subnode2",
          ],
        },
        {
          noIcon: false,
          nodeClasses: [
            "switch2Image scene610-5subnode1",
            "switch2Image scene610-5subnode2",
          ],
        },
      ],
    },
    {
      name: "4 Switch (1-25A) 1 Fan 1 Curtain",
      nodeSize: 5,
      className: "scene6",
      nodes: [
        {
          noIcon: false,
          nodeClasses: [
            "switch2Image scene610-1subnode1",
            "switch2Image scene610-1subnode2",
          ],
        },
        {
          noIcon: false,
          nodeClasses: [
            "switch2Image scene610-2subnode1",
            "switch2Image scene610-2subnode2",
          ],
        },
        { noIcon: true, nodeClasses: ["switch2ImageDimmer scene4f-subnodef"] },
        {
         noIcon: false,
          nodeClasses: [
            "switch2ImageFan switch2ImageFansubnode1 scene4f-subnoded",
          ],
        },
        { noIcon: false,  nodeClasses: [
          "curtain1Image scene4-1subnode1",
          "curtain2Image scene4-1subnode2",
        ], },
      ],
    },
    {
      name: "8 Switch (2-20A) 1 Curtain",
      nodeSize: 5,
      className: "scene6",
      nodes: [
        {
          noIcon: false,
          nodeClasses: [
            "switch2Image scene610-1subnode1",
            "switch2Image scene610-1subnode2",
          ],
        },
        {
          noIcon: false,
          nodeClasses: [
            "switch2Image scene610-2subnode1",
            "switch2Image scene610-2subnode2",
          ],
        },
        {
          noIcon: false,
          nodeClasses: [
            "switch2Image scene610-3subnode1",
            "switch2Image scene610-3subnode2",
          ],
        },
        {
          noIcon: false,
          nodeClasses: [
            "switch2Image scene610-4subnode1",
            "switch2Image scene610-4subnode2",
          ],
        },
        {
          noIcon: false,
          nodeClasses: [
            "curtain1Image scene4-1subnode1",
            "curtain2Image scene4-1subnode2",
          ],
        },
      ],
    },
  ],
  "12 module": [
    {
      name: "12 Switch (2-25A) 2 Fan",
      nodeSize: 5,
      className: "scene12",
      nodes: [
        {
          noIcon: false,
          panel1: true,
          panel2: true,
          nodeClasses: [
            "switch2Image scene610-1subnode1",
            "switch2Image scene610-1subnode2",
          ],
        },
        {
          noIcon: false,
          panel1: true,
          panel2: true,
          nodeClasses: [
            "switch2Image scene610-2subnode1",
            "switch2Image scene610-2subnode2",
          ],
        },
        {
          noIcon: false,
          panel1: true,
          panel2: true,
          nodeClasses: [
            "switch2Image scene610-3subnode1",
            "switch2Image scene610-3subnode2",
          ],
        },
        { noIcon: true,  panel1: true,
          panel2: true, nodeClasses: ["switch2ImageDimmer scene4f-subnodef"] },
        {
          noIcon: false,
          panel1: true,
          panel2: true,
          nodeClasses: [
            "switch2ImageFan switch2ImageFansubnode1 scene4f-subnoded",
          ],
        },
      ],
    },
    {
      name: "20 Switch (4-20A)",
      nodeSize: 5,
      className: "scene12",
      nodes: [
        {
          noIcon: false,
          panel1: true,
          panel2: true,
          nodeClasses: [
            "switch2Image scene610-1subnode1",
            "switch2Image scene610-1subnode2",
          ],
        },
        {
          noIcon: false,
          panel1: true,
          panel2: true,
          nodeClasses: [
            "switch2Image scene610-2subnode1",
            "switch2Image scene610-2subnode2",
          ],
        },
        {
          noIcon: false,
          panel1: true,
          panel2: true,
          nodeClasses: [
            "switch2Image scene610-3subnode1",
            "switch2Image scene610-3subnode2",
          ],
        },
        {
          noIcon: false,
          panel1: true,
          panel2: true,
          nodeClasses: [
            "switch2Image scene610-4subnode1",
            "switch2Image scene610-4subnode2",
          ],
        },
        {
          noIcon: false,
          panel1: true,
          panel2: true,
          nodeClasses: [
            "switch2Image scene610-5subnode1",
            "switch2Image scene610-5subnode2",
          ],
        },
      ],
    },
    {
      name: "14 Switch (2-25A) 2 Fan",
      nodeSize: 5,
      className: "scene12",
      nodes: [
        {
          noIcon: false,
          panel1: true,
          panel2: true,
          nodeClasses: [
            "switch2Image scene610-1subnode1",
            "switch2Image scene610-1subnode2",
          ],
        },
        {
          noIcon: false,
          panel1: true,
          panel2: true,
          nodeClasses: [
            "switch2Image scene610-2subnode1",
            "switch2Image scene610-2subnode2",
          ],
        },
        {
          noIcon: false,
          panel1: true,
          nodeClasses: [
            "switch2Image scene610-3subnode1",
            "switch2Image scene610-3subnode2",
          ],
        },
        {
          noIcon: false,
          panel1: true,
          nodeClasses: [
            "switch2Image scene610-4subnode1",
            "switch2Image scene610-4subnode2",
          ],
        },
        {
          noIcon: false,
          panel1: true,
          nodeClasses: [
            "switch2Image scene610-5subnode1",
            "switch2Image scene610-5subnode2",
          ],
        },
        { noIcon: true,
          panel2: true, nodeClasses: ["switch2ImageDimmer scene4f-subnodef"] },
        {
         noIcon: false,
          panel2: true,
          nodeClasses: [
            "switch2ImageFan switch2ImageFansubnode1 scene4f-subnoded",
          ],
        },
        { noIcon: true,
          panel2: true, nodeClasses: ["switch2ImageDimmer scene4f-subnodef"] },
        {
         noIcon: false,
          panel2: true,
          nodeClasses: [
            "switch2ImageFan switch2ImageFansubnode1 scene4f-subnoded",
          ],
        },
      ],
    },
    {
      name: "8 Switch 4 Fan",
      nodeSize: 5,
      className: "scene12",
      nodes: [
        {
          noIcon: false,
          panel1: true,
          panel2: true,
          nodeClasses: [
            "switch2Image scene610-1subnode1",
            "switch2Image scene610-1subnode2",
          ],
        },
        {
          noIcon: false,
          panel1: true,
          panel2: true,
          nodeClasses: [
            "switch2Image scene610-2subnode1",
            "switch2Image scene610-2subnode2",
          ],
        },
        { noIcon: true, panel1: true,
          panel2: true, nodeClasses: ["switch2ImageDimmer scene4f-subnodef"] },
        {
          noIcon: false,  panel1: true,
          panel2: true,
          nodeClasses: [
            "switch2ImageFan switch2ImageFansubnode1 scene4f-subnoded",
          ],
        },
        { noIcon: true,  panel1: true,
          panel2: true, nodeClasses: ["switch2ImageDimmer scene4f-subnodef"] },
        {
          noIcon: false, panel1: true,
          panel2: true,
          nodeClasses: [
            "switch2ImageFan switch2ImageFansubnode1 scene4f-subnoded",
          ],
        },
      ],
    },
    {
      name: "16 Switch (1-20A , 2-25A) 1 Fan",
      nodeSize: 5,
      className: "scene12",
      nodes: [
        {
          noIcon: false,
          panel1: true,
          panel2: true,
          nodeClasses: [
            "switch2Image scene610-1subnode1",
            "switch2Image scene610-1subnode2",
          ],
        },
        {
          noIcon: false,
          panel1: true,
          panel2: true,
          nodeClasses: [
            "switch2Image scene610-2subnode1",
            "switch2Image scene610-2subnode2",
          ],
        },
        {
          noIcon: false,
          panel1: true,
          panel2: true,
          nodeClasses: [
            "switch2Image scene610-3subnode1",
            "switch2Image scene610-3subnode2",
          ],
        },
        {
          noIcon: false,
          panel1: true,
          nodeClasses: [
            "switch2Image scene610-4subnode1",
            "switch2Image scene610-4subnode2",
          ],
        },
        {
          noIcon: false,
          panel1: true,
          nodeClasses: [
            "switch2Image scene610-5subnode1",
            "switch2Image scene610-5subnode2",
          ],
        },
        { noIcon: true,
          panel2: true, nodeClasses: ["switch2ImageDimmer scene4f-subnodef"] },
        {
          noIcon: false,
          panel2: true,
          nodeClasses: [
            "switch2ImageFan switch2ImageFansubnode1 scene4f-subnoded",
          ],
        },
      ],
    },
    {
      name: "6 Switch (1-25A) 2 Fan 2 Socket (2-10A)",
      nodeSize: 5,
      className: "scene12",
      nodes: [
        {
          noIcon: false,
          panel1: true,
          nodeClasses: [
            "switch2Image scene610-1subnode1",
            "switch2Image scene610-1subnode2",
          ],
        },
        {
          noIcon: false,
          panel1: true,
          nodeClasses: [
            "switch2Image scene610-2subnode1",
            "switch2Image scene610-2subnode2",
          ],
        },
        { noIcon: true,
          panel1: true, nodeClasses: ["switch2ImageDimmer scene4f-subnodef"] },
        {
          noIcon: false,
          panel1: true,
          nodeClasses: [
            "switch2ImageFan switch2ImageFansubnode1 scene4f-subnoded",
          ],
        },
        { noIcon: true,
          panel1: true, nodeClasses: ["switch2ImageDimmer scene4f-subnodef"] },
        {
          noIcon: false,
          panel1: true,
          nodeClasses: [
            "switch2ImageFan switch2ImageFansubnode1 scene4f-subnoded",
          ],
        },
        { noIcon: true,  panel2: true, nodeClasses: ["sixampImage right7"] },
        {
          noIcon: false,
          panel2: true,
          nodeClasses: [
            "switch2Image scene610-3subnode1",
            "switch2Image scene610-3subnode2",
          ],
        },
        { noIcon: true,  panel2: true, nodeClasses: ["sixampImage right-5"] },
      ],
    },
    {
      name: "8 Switch (2-25A) 1 Fan 2 Socket (2-10A)",
      nodeSize: 5,
      className: "scene12",
      nodes: [
        {
          noIcon: false,
          panel1: true,
          nodeClasses: [
            "switch2Image scene610-1subnode1",
            "switch2Image scene610-1subnode2",
          ],
        },
        {
          noIcon: false,
          panel1: true,
          nodeClasses: [
            "switch2Image scene610-2subnode1",
            "switch2Image scene610-2subnode2",
          ],
        },
        {
          noIcon: false,
          panel1: true,
          nodeClasses: [
            "switch2Image scene610-3subnode1",
            "switch2Image scene610-3subnode2",
          ],
        },
        { noIcon: true,
          panel1: true, nodeClasses: ["switch2ImageDimmer scene4f-subnodef"] },
        {
          noIcon: false,
          panel1: true,
          nodeClasses: [
            "switch2ImageFan switch2ImageFansubnode1 scene4f-subnoded",
          ],
        },
        { noIcon: true,  panel2: true, nodeClasses: ["sixampImage right7"] },
        {
          noIcon: false,
          panel2: true,
          nodeClasses: [
            "switch2Image scene610-3subnode1",
            "switch2Image scene610-3subnode2",
          ],
        },
        { noIcon: true,  panel2: true, nodeClasses: ["sixampImage right-5"] },
      ],
    },
    {
      name: "10 Switch (2-25A) 3 Socket (2-10A)",
      tronixFlag: true,
      nodeSize: 5,
      className: "scene12",
      nodes: [
        {
          noIcon: false,
          panel1: true,
          nodeClasses: [
            "switch2Image scene610-1subnode1",
            "switch2Image scene610-1subnode2",
          ],
        },
        {
          noIcon: false,
          panel1: true,
          nodeClasses: [
            "switch2Image scene610-2subnode1",
            "switch2Image scene610-2subnode2",
          ],
        },
        {
          noIcon: false,
          panel1: true,
          nodeClasses: [
            "switch2Image scene610-3subnode1",
            "switch2Image scene610-3subnode2",
          ],
        },
        {
          noIcon: false,
          panel1: true,
          nodeClasses: [
            "switch2Image scene610-3subnode1",
            "switch2Image scene610-3subnode2",
          ],
        },
        {
          noIcon: false,
          panel1: true,
          nodeClasses: [
            "switch2Image scene610-3subnode1",
            "switch2Image scene610-3subnode2",
          ],
        },
        
        { noIcon: true,  panel2: true, nodeClasses: ["sixampImage right7"] },
        { noIcon: true,  panel2: true, nodeClasses: ["sixampImage right-1"] },
        { noIcon: true,  panel2: true, nodeClasses: ["sixampImage right-5"] },
      ],
    },
    {
      name: "8 Switch (2-25A) 1 Fan 3 Socket (2-10A)",
      tronixFlag: true,
      nodeSize: 5,
      className: "scene12",
      nodes: [
        {
          noIcon: false,
          panel1: true,
          nodeClasses: [
            "switch2Image scene610-1subnode1",
            "switch2Image scene610-1subnode2",
          ],
        },
        {
          noIcon: false,
          panel1: true,
          nodeClasses: [
            "switch2Image scene610-2subnode1",
            "switch2Image scene610-2subnode2",
          ],
        },
        {
          noIcon: false,
          panel1: true,
          nodeClasses: [
            "switch2Image scene610-3subnode1",
            "switch2Image scene610-3subnode2",
          ],
        },
        {
          noIcon: false,
          panel1: true,
          nodeClasses: [
            "switch2Image scene610-3subnode1",
            "switch2Image scene610-3subnode2",
          ],
        },
        { noIcon: true,
          panel1: true, nodeClasses: ["switch2ImageDimmer scene4f-subnodef"] },
        {
          noIcon: false,
          panel1: true,
          nodeClasses: [
            "switch2ImageFan switch2ImageFansubnode1 scene4f-subnoded",
          ],
        },
        { noIcon: true,  panel2: true, nodeClasses: ["sixampImage right7"] },
        { noIcon: true,  panel2: true, nodeClasses: ["sixampImage right-1"] },
        { noIcon: true,  panel2: true, nodeClasses: ["sixampImage right-5"] },
      ],
    },
    {
      name: "12 Switch (3-25A) 1 Fan 2 Socket (2-10A)",
      nodeSize: 5,
      className: "scene12",
      nodes: [
        {
          noIcon: false,
          panel1: true,
          nodeClasses: [
            "switch2Image scene610-1subnode1",
            "switch2Image scene610-1subnode2",
          ],
        },
        {
          noIcon: false,
          panel1: true,
          nodeClasses: [
            "switch2Image scene610-2subnode1",
            "switch2Image scene610-2subnode2",
          ],
        },
        {
          noIcon: false,
          panel1: true,
          nodeClasses: [
            "switch2Image scene610-3subnode1",
            "switch2Image scene610-3subnode2",
          ],
        },
        {
          noIcon: false,
          panel1: true,
          nodeClasses: [
            "switch2Image scene610-4subnode1",
            "switch2Image scene610-4subnode2",
          ],
        },
        { noIcon: true,
          panel1: true, nodeClasses: ["switch2ImageDimmer scene4f-subnodef"] },
        {
          noIcon: false,
          panel1: true,
          nodeClasses: [
            "switch2ImageFan switch2ImageFansubnode1 scene4f-subnoded",
          ],
        },
        { noIcon: true,  panel2: true, nodeClasses: ["sixampImage right7"] },
        {
          noIcon: false,
          panel2: true,
          nodeClasses: [
            "switch2Image scene610-3subnode1",
            "switch2Image scene610-3subnode2",
          ],
        },
        {
          noIcon: false,
          panel2: true,
          nodeClasses: [
            "switch2Image scene610-4subnode1",
            "switch2Image scene610-4subnode2",
          ],
        },
        { noIcon: true,  panel2: true, nodeClasses: ["sixampImage right-5"] },
      ],
    },
    {
      name: "12 Switch (3-25A) 2 Socket (2-10A)",
      nodeSize: 5,
      className: "scene12",
      nodes: [
        {
          noIcon: false,
          panel1: true,
          nodeClasses: [
            "switch2Image scene610-1subnode1",
            "switch2Image scene610-1subnode2",
          ],
        },
        {
          noIcon: false,
          panel1: true,
          nodeClasses: [
            "switch2Image scene610-2subnode1",
            "switch2Image scene610-2subnode2",
          ],
        },
        {
          noIcon: false,
          panel1: true,
          nodeClasses: [
            "switch2Image scene610-3subnode1",
            "switch2Image scene610-3subnode2",
          ],
        },
        {
          noIcon: false,
          panel1: true,
          nodeClasses: [
            "switch2Image scene610-4subnode1",
            "switch2Image scene610-4subnode2",
          ],
        },
        {
          noIcon: false,
          panel1: true,
          nodeClasses: [
            "switch2Image scene610-5subnode1",
            "switch2Image scene610-5subnode2",
          ],
        },
        { noIcon: true,  panel2: true, nodeClasses: ["sixampImage right7"] },
        {
          noIcon: false,
          panel2: true,
          nodeClasses: [
            "switch2Image scene610-3subnode1",
            "switch2Image scene610-3subnode2",
          ],
        },
        { noIcon: true,  panel2: true, nodeClasses: ["sixampImage right-5"] },
      ],
    },
    {
      name: "8 Switch 2 Fan 2 Socket (2-10A)",
      nodeSize: 5,
      className: "scene12",
      nodes: [
        {
          noIcon: false,
          panel1: true,
          nodeClasses: [
            "switch2Image scene610-1subnode1",
            "switch2Image scene610-1subnode2",
          ],
        },
        {
          noIcon: false,
          panel1: true,
          nodeClasses: [
            "switch2Image scene610-2subnode1",
            "switch2Image scene610-2subnode2",
          ],
        },
        { noIcon: true,
          panel1: true, nodeClasses: ["switch2ImageDimmer scene4f-subnodef"] },
        {
          noIcon: false,
          panel1: true,
          nodeClasses: [
            "switch2ImageFan switch2ImageFansubnode1 scene4f-subnoded",
          ],
        },
        { noIcon: true,
          panel1: true, nodeClasses: ["switch2ImageDimmer scene4f-subnodef"] },
        {
          noIcon: false,
          panel1: true,
          nodeClasses: [
            "switch2ImageFan switch2ImageFansubnode1 scene4f-subnoded",
          ],
        },
        { noIcon: true,  panel2: true, nodeClasses: ["sixampImage right7"] },
        {
          noIcon: false,
          panel2: true,
          nodeClasses: [
            "switch2Image scene610-3subnode1",
            "switch2Image scene610-3subnode2",
          ],
        },
        {
          noIcon: false,
          panel2: true,
          nodeClasses: [
            "switch2Image scene610-4subnode1",
            "switch2Image scene610-4subnode2",
          ],
        },
        { noIcon: true,  panel2: true, nodeClasses: ["sixampImage right-5"] },
      ],
    },
    {
      name: "10 Switch (1-25A) 1 Fan 2 Socket (2-10A)",
      nodeSize: 5,
      className: "scene12",
      nodes: [
        {
          noIcon: false,
          panel1: true,
          nodeClasses: [
            "switch2Image scene610-1subnode1",
            "switch2Image scene610-1subnode2",
          ],
        },
        {
          noIcon: false,
          panel1: true,
          nodeClasses: [
            "switch2Image scene610-2subnode1",
            "switch2Image scene610-2subnode2",
          ],
        },
        {
          noIcon: false,
          panel1: true,
          nodeClasses: [
            "switch2Image scene610-3subnode1",
            "switch2Image scene610-3subnode2",
          ],
        },
        { noIcon: true,
          panel1: true, nodeClasses: ["switch2ImageDimmer scene4f-subnodef"] },
        {
          noIcon: false,
          panel1: true,
          nodeClasses: [
            "switch2ImageFan switch2ImageFansubnode1 scene4f-subnoded",
          ],
        },
        { noIcon: true,  panel2: true, nodeClasses: ["sixampImage right7"] },
        {
          noIcon: false,
          panel2: true,
          nodeClasses: [
            "switch2Image scene610-3subnode1",
            "switch2Image scene610-3subnode2",
          ],
        },
        {
          noIcon: false,
          panel2: true,
          nodeClasses: [
            "switch2Image scene610-4subnode1",
            "switch2Image scene610-4subnode2",
          ],
        },
        { noIcon: true,  panel2: true, nodeClasses: ["sixampImage right-5"] },
      ],
    },
    {
      name: " 14 Switch (2-25A) 2 Socket (2-10A)",
      nodeSize: 5,
      className: "scene12",
      nodes: [
        {
          noIcon: false,
          panel1: true,
          nodeClasses: [
            "switch2Image scene610-1subnode1",
            "switch2Image scene610-1subnode2",
          ],
        },
        {
          noIcon: false,
          panel1: true,
          nodeClasses: [
            "switch2Image scene610-2subnode1",
            "switch2Image scene610-2subnode2",
          ],
        },
        {
          noIcon: false,
          panel1: true,
          nodeClasses: [
            "switch2Image scene610-3subnode1",
            "switch2Image scene610-3subnode2",
          ],
        },
        {
          noIcon: false,
          panel1: true,
          nodeClasses: [
            "switch2Image scene610-4subnode1",
            "switch2Image scene610-4subnode2",
          ],
        },
        {
          noIcon: false,
          panel1: true,
          nodeClasses: [
            "switch2Image scene610-5subnode1",
            "switch2Image scene610-5subnode2",
          ],
        },
        { noIcon: true,  panel2: true, nodeClasses: ["sixampImage right7"] },
        {
          noIcon: false,
          panel2: true,
          nodeClasses: [
            "switch2Image scene610-3subnode1",
            "switch2Image scene610-3subnode2",
          ],
        },
        {
          noIcon: false,
          panel2: true,
          nodeClasses: [
            "switch2Image scene610-4subnode1",
            "switch2Image scene610-4subnode2",
          ],
        },
        { noIcon: true,  panel2: true, nodeClasses: ["sixampImage right-5"] },
      ],
    },
    {
      name: "10 Switch (3-25A) 2 Socket (2-10A) 1 Curtain",
      nodeSize: 5,
      className: "scene12",
      nodes: [
        {
          noIcon: false,
          panel1: true,
          nodeClasses: [
            "switch2Image scene610-1subnode1",
            "switch2Image scene610-1subnode2",
          ],
        },
        {
          noIcon: false,
          panel1: true,
          nodeClasses: [
            "switch2Image scene610-2subnode1",
            "switch2Image scene610-2subnode2",
          ],
        },
        {
          noIcon: false,
          panel1: true,
          nodeClasses: [
            "switch2Image scene610-3subnode1",
            "switch2Image scene610-3subnode2",
          ],
        },
        {
          noIcon: false,
          panel1: true,
          nodeClasses: [
            "switch2Image scene610-4subnode1",
            "switch2Image scene610-4subnode2",
          ],
        },
        {
          noIcon: false,
          panel1: true,
          nodeClasses: [
            "switch2Image scene610-5subnode1",
            "switch2Image scene610-5subnode2",
          ],
        },
        { noIcon: true,  panel2: true, nodeClasses: ["sixampImage right7"] },
        {
          noIcon: false,
          panel2: true,
          nodeClasses: [
            "curtain1Image scene4-1subnode1",
            "curtain2Image scene4-1subnode2",
          ],
        },
        { noIcon: true,  panel2: true, nodeClasses: ["sixampImage right-5"] },
      ],
    },
    {
      name: "16 Switch (4-25A) 2 Curtain",
      nodeSize: 5,
      className: "scene12",
      nodes: [
        {
          noIcon: false,
          panel1: true,
          panel2: true,
          nodeClasses: [
            "switch2Image scene610-1subnode1",
            "switch2Image scene610-1subnode2",
          ],
        },
        {
          noIcon: false,
          panel1: true,
          panel2: true,
          nodeClasses: [
            "switch2Image scene610-2subnode1",
            "switch2Image scene610-2subnode2",
          ],
        },
        {
          noIcon: false,
          panel1: true,
          panel2: true,
          nodeClasses: [
            "switch2Image scene610-3subnode1",
            "switch2Image scene610-3subnode2",
          ],
        },
        {
          noIcon: false,
          panel1: true,
          panel2: true,
          nodeClasses: [
            "switch2Image scene610-4subnode1",
            "switch2Image scene610-4subnode2",
          ],
        },
        { noIcon: false,panel1: true,  panel2: true,  nodeClasses: [
          "curtain1Image scene4-1subnode1",
          "curtain2Image scene4-1subnode2",
        ], },
      ],
    },
    //{name:'10 Switch', nodeSize: 5, className:'scene6',nodes: [{nodeClasses:['switch2Image scene610-1subnode1','switch2Image scene610-1subnode2']},{nodeClasses:['switch2Image scene610-2subnode1','switch2Image scene610-2subnode2']},{nodeClasses:['switch2Image scene610-3subnode1','switch2Image scene610-3subnode2']},{nodeClasses:['switch2Image scene610-4subnode1','switch2Image scene610-4subnode2']},{nodeClasses:['switch2Image scene610-5subnode1','switch2Image scene610-5subnode2']}]},
    // {name: '8 Switch + 1 Fan', nodeSize: 6, className:'scene6',nodes: [{nodeClasses:['switch2Image scene610-1subnode1','switch2Image scene610-1subnode2']},{nodeClasses:['switch2Image scene610-2subnode1','switch2Image scene610-2subnode2']},{nodeClasses:['switch2Image scene610-3subnode1','switch2Image scene610-3subnode2']},{nodeClasses:['switch2Image scene610-4subnode1','switch2Image scene610-4subnode2']},{nodeClasses:['switch2ImageFan switch2ImageFansubnode1 scene8f-subnodef']},{nodeClasses:['switch2ImageDimmer scene8f-subnoded']}]},
    // {name: '4 Switch + 2 Fan', nodeSize: 6, className:'scene6',nodes: [{nodeClasses:['switch2Image scene610-1subnode1','switch2Image scene610-1subnode2']},{nodeClasses:['switch2Image scene610-2subnode1','switch2Image scene610-2subnode2']},{nodeClasses:['switch2ImageFan switch2ImageFansubnode1 scene8f1-subnodef']},{nodeClasses:['switch2ImageDimmer scene8f1-subnoded']},{nodeClasses:['switch2ImageFan switch2ImageFansubnode1 scene8f2-subnodef']},{nodeClasses:['switch2ImageDimmer scene8f2-subnoded']}]},
  ],
};

const icons = {
  Shapes: [
    "./assets/Shapes/CIRCLE.svg",
    "./assets/Shapes/SQUARE.svg",
    "./assets/Shapes/VERTICALLINE.svg",
    "./assets/Shapes/HORIZONTALLINE.svg",
    "./assets/Shapes/RSQUARE.svg",
  ],
  "Decorative Lights": [
    "./assets/Decorative%20Lights/1.svg",
    "./assets/Decorative%20Lights/2.svg",
    "./assets/Decorative%20Lights/3.svg",
    "./assets/Decorative%20Lights/HL.svg",
    "./assets/Decorative%20Lights/HL2.svg",
    "./assets/Decorative%20Lights/HL3.svg",
    "./assets/Decorative%20Lights/HL5.svg",
    "./assets/Decorative%20Lights/HL6.svg",
    "./assets/Decorative%20Lights/HL7.svg",
    "./assets/Decorative%20Lights/HL8.svg",
    "./assets/Decorative%20Lights/HL9.svg",
    "./assets/Decorative%20Lights/HL10.svg",
    "./assets/Decorative%20Lights/HL11.svg",
    "./assets/Decorative%20Lights/HL12.svg",
    "./assets/Decorative%20Lights/HL13.svg",
    "./assets/Decorative%20Lights/HL15.svg",
    "./assets/Decorative%20Lights/HL16.svg",
    "./assets/Decorative%20Lights/HL17.svg",
    "./assets/Decorative%20Lights/HL18.svg",
    "./assets/Decorative%20Lights/Security%20Camera 1.svg",
    "./assets/Decorative%20Lights/Security%20Camera.svg",
  ],
  "Curtains": [
    "./assets/Curtains/7.svg",
    "./assets/Curtains/8.svg",
    "./assets/Curtains/9.svg",
  ],
  "Home Appliances": [
    "./assets/Home%20Appliances/1%20(1).svg",
    "./assets/Home%20Appliances/2%20(1).svg",
    "./assets/Home Appliances/3%20(1).svg",
    "./assets/Home Appliances/4.svg",
    "./assets/Home Appliances/5.svg",
    "./assets/Home Appliances/6.svg",
    "./assets/Home Appliances/7.svg",
    "./assets/Home Appliances/8.svg",
    "./assets/Home Appliances/9.svg",
    "./assets/Home Appliances/10.svg",
    "./assets/Home Appliances/11.svg",
    "./assets/Home Appliances/12.svg",
    "./assets/Home Appliances/13.svg",
    "./assets/Home Appliances/14.svg",
    "./assets/Home Appliances/15.svg",
    "./assets/Home Appliances/16.svg",
    "./assets/Home Appliances/18.svg",
    "./assets/Home Appliances/19.svg",
    "./assets/Home Appliances/Appliances-91.svg",
    "./assets/Home Appliances/Appliances-92.svg",
    "./assets/Home Appliances/Appliances-93.svg",
    "./assets/Home Appliances/Appliances-94.svg",
    "./assets/Home Appliances/Appliances-95.svg",
    "./assets/Home Appliances/Appliances-96.svg",
    "./assets/Home Appliances/Appliances-97.svg",
    "./assets/Home Appliances/Appliances-98.svg",
    "./assets/Home Appliances/Appliances-99.svg",
    "./assets/Home Appliances/Appliances-100.svg",
    "./assets/Home Appliances/Appliances-101.svg",
    "./assets/Home Appliances/Appliances-102.svg",
    "./assets/Home Appliances/Appliances-103.svg",
    "./assets/Home Appliances/Appliances-104.svg",
    "./assets/Home Appliances/Appliances-105.svg",
    "./assets/Home Appliances/Appliances-106.svg",
  ],
  Scene: [
    "./assets/Scene/1.svg",
    "./assets/Scene/2.svg",
    "./assets/Scene/3.svg",
    "./assets/Scene/4.svg",
    "./assets/Scene/5.svg",
    "./assets/Scene/6.svg",
    "./assets/Scene/7.svg",
    "./assets/Scene/8.svg",
    "./assets/Scene/9.svg",
    "./assets/Scene/10.svg",
    "./assets/Scene/11.svg",
    "./assets/Scene/12.svg",
    "./assets/Scene/Scene-71.svg",
    "./assets/Scene/Scene-72.svg",
    "./assets/Scene/Scene-73.svg",
    "./assets/Scene/Scene-74.svg",
    "./assets/Scene/Scene-75.svg",
    "./assets/Scene/Scene-76.svg",
    "./assets/Scene/Scene-77.svg",
    "./assets/Scene/Scene-78.svg",
    "./assets/Scene/Scene-79.svg",
    "./assets/Scene/Scene-80.svg",
    "./assets/Scene/Scene-81.svg",
    "./assets/Scene/Scene-82.svg",
    "./assets/Scene/Scene-83.svg",
    "./assets/Scene/Scene-84.svg",
    "./assets/Scene/Scene-85.svg",
    "./assets/Scene/Scene-86.svg",
    "./assets/Scene/Scene-87.svg",
  ],
  Necessity: [
    "./assets/Necessity/AC.svg",
    "./assets/Necessity/AC2.svg",
    "./assets/Necessity/Coffee Mixer.svg",
    "./assets/Necessity/Cooking Cooker.svg",
    "./assets/Necessity/Fridge.svg",
    "./assets/Necessity/Geyser.svg",
    "./assets/Necessity/Hair Dryer.svg",
    "./assets/Necessity/Kettle.svg",
    "./assets/Necessity/Mixer.svg",
    "./assets/Necessity/Mixer3.svg",
    "./assets/Necessity/Mixer4.svg",
    "./assets/Necessity/Oven2.svg",
    "./assets/Necessity/Radio.svg",
    "./assets/Necessity/Toaster.svg",
    "./assets/Necessity/TV.svg",
    "./assets/Necessity/Washing Machine.svg",
  ],
  Light: [
    "./assets/Lights/L1.svg",
    "./assets/Lights/L2.svg",
    "./assets/Lights/L3.svg",
    "./assets/Lights/L4.svg",
    "./assets/Lights/L5.svg",
    "./assets/Lights/L6.svg",
    "./assets/Lights/L7.svg",
    "./assets/Lights/L8.svg",
    "./assets/Lights/L9.svg",
    "./assets/Lights/L10.svg",
    "./assets/Lights/L11.svg",
    "./assets/Lights/L12.svg",
    "./assets/Lights/L13.svg",
    "./assets/Lights/L14.svg",
    "./assets/Lights/L15.svg",
    "./assets/Lights/Lamp-11.svg",
    "./assets/Lights/Lamp-12.svg",
    "./assets/Lights/Lamp-13.svg",
    "./assets/Lights/Lamp-14.svg",
    "./assets/Lights/Lamp-15.svg",
    "./assets/Lights/Lamp-16.svg",
    "./assets/Lights/Lamp-17.svg",
    "./assets/Lights/Lamp-18.svg",
    "./assets/Lights/Lamp-19.svg",
    "./assets/Lights/Lamp-20.svg",
    "./assets/Lights/Lamp-21.svg",
    "./assets/Lights/Lamp-22.svg",
    "./assets/Lights/Lamp-23.svg",
    "./assets/Lights/Lamp-24.svg",
    "./assets/Lights/Lamp-25.svg",
    "./assets/Lights/Lamp-26.svg",
    "./assets/Lights/Lamp-27.svg",
  ],
  "COB Lighting": [
    "./assets/COB Lighting/CL1.svg",
    "./assets/COB Lighting/CL2.svg",
    "./assets/COB Lighting/CL3.svg",
  ],
  Sockets: [
    "./assets/Sockets/1.svg",
    "./assets/Sockets/2.svg",
    "./assets/Sockets/3.svg",
    "./assets/Sockets/4.svg",
    "./assets/Sockets/5.svg",
    "./assets/Sockets/6.svg",
    "./assets/Sockets/7.svg",
    "./assets/Sockets/Accessorie-01.svg",
    "./assets/Sockets/Accessorie-02.svg",
    "./assets/Sockets/Accessorie-03.svg",
    "./assets/Sockets/Accessorie-04.svg",
    "./assets/Sockets/Accessorie-05.svg",
    "./assets/Sockets/Accessorie-06.svg",
    "./assets/Sockets/Accessorie-07.svg",
  ],
  Fan: [
    "./assets/Fans/F1.svg",
    "./assets/Fans/F2.svg",
    "./assets/Fans/F4.svg",
    "./assets/Fans/F5.svg",
    "./assets/Fans/F6.svg",
    "./assets/Fans/F7.svg",
    "./assets/Fans/F8.svg",
    "./assets/Fans/F10.svg",
    "./assets/Fans/F11.svg",
    "./assets/Fans/F12.svg",
    "./assets/Fans/F13.svg",
    "./assets/Fans/F14.svg",
    "./assets/Fans/F15.svg",
    "./assets/Fans/F16.svg",
    "./assets/Fans/F17.svg",
    "./assets/Fans/F18.svg",
    "./assets/Fans/F19.svg",
    "./assets/Fans/F20.svg",
    "./assets/Fans/F21.svg",
    "./assets/Fans/Fan Default.svg",
  ],
  "BLDC Fan": [
    "./assets/BLDC Fans/1.svg",
    "./assets/BLDC Fans/2.svg",
    "./assets/BLDC Fans/3.svg",
    "./assets/BLDC Fans/4.svg",
    "./assets/BLDC Fans/5.svg",
    "./assets/BLDC Fans/6.svg",
    "./assets/BLDC Fans/7.svg",
    "./assets/BLDC Fans/8.svg",
    "./assets/BLDC Fans/9.svg",
    "./assets/BLDC Fans/10.svg",
    "./assets/BLDC Fans/11.svg",
    "./assets/BLDC Fans/12.svg",
    "./assets/BLDC Fans/13.svg",
  ],
  Numbers: [
    "./assets/Numbers/0.svg",
    "./assets/Numbers/1.svg",
    "./assets/Numbers/1B.svg",
    "./assets/Numbers/2.svg",
    "./assets/Numbers/2B.svg",
    "./assets/Numbers/3.svg",
    "./assets/Numbers/3B.svg",
    "./assets/Numbers/4.svg",
    "./assets/Numbers/4B.svg",
    "./assets/Numbers/5.svg",
    "./assets/Numbers/5B.svg",
    "./assets/Numbers/6.svg",
    "./assets/Numbers/6B.svg",
    "./assets/Numbers/7.svg",
    "./assets/Numbers/7B.svg",
    "./assets/Numbers/8.svg",
    "./assets/Numbers/8B.svg",
    "./assets/Numbers/9.svg",
    "./assets/Numbers/9B.svg",
  ],
};

const DraggableIcon = ({ icon, index, onDrop }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "icon",
    item: { icon, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <img
      ref={drag}
      src={icon}
      alt={`icon-${index}`}
      className={`w-1/2 ${isDragging ? "opacity-50" : "opacity-100"}`}
    />
  );
};

const DroppableAccessory = ({
  subnode,
  nodeIndex,
  curnode,
  noIcon,
  subnodeIndex,
  category,
  accessory,
  indexToRemove,
  onDrop,
  activeStep = 0,
}) => {
  console.log("DroppableAccessory", subnode, indexToRemove, noIcon);
  const [, drop] = useDrop(() => ({
    accept: "icon",
    drop: (item) => {
      if(((!noIcon))){
      let pnode = document.getElementById(`${subnode}-${indexToRemove}-${curnode == '1' ? "panel1" : curnode == '2' ? "panel2" : ""}`);
      let node = document.getElementById(`${subnode}-${indexToRemove}-${curnode == '1' ? "panel1" : curnode == '2' ? "panel2" : ""}-svg`);
     // console.log(item, subnode, indexToRemove);

     pnode.style.border = "none";
     pnode.style.backgroundImage = "none";
      if (node) {
        fetch(item.icon)
          .then((response) => response.text())
          .then((svgContent) => {
            node.innerHTML = svgContent;
          });
        const imgTag = node.querySelector("img");
        if (imgTag) {
          //imgTag.src = item.icon; // Set the src attribute of the img tag
        }
      }
      onDrop(
        category,
        accessory,
        indexToRemove,
        item.icon,
        nodeIndex,
        subnodeIndex
      );
      }
    },
  }));

  return (
    <>
      <div
        ref={drop}
        className={`${subnode}`}
        id={`${subnode}-${indexToRemove}-${curnode == '1' ? "panel1" : curnode == '2' ? "panel2" : ""}`}
      >
        {activeStep == 3 && ((!noIcon)) && (
          <DeleteIcon
            className="delete"
            onClick={() => {
              let node = document.getElementById(`${subnode}-${indexToRemove}-${curnode == '1' ? "panel1" : curnode == '2' ? "panel2" : ""}`);
              let cnode = document.getElementById(
                `${subnode}-${indexToRemove}-${curnode == '1' ? "panel1" : curnode == '2' ? "panel2" : ""}-svg`
              );
              //node.style.border = "1px solid #ffffff";
              node.style.backgroundImage = "url(./assets/Shapes/VERTICALLINE.svg)";
              cnode.innerHTML = "";
            }}
            fontSize="small"
            style={{
              bottom: "-10px",
              left: "-25px",
              color: "white",
              position: "relative",
            }}
          />
        )}
        <div id={`${subnode}-${indexToRemove}-${curnode == '1' ? "panel1" : curnode == '2' ? "panel2" : ""}-svg`}></div>
      </div>
    </>
  );
};

const StepperComponent = () => {
  const divRef = useRef();
  const [component, setComponent] = useState("stepper");
  const [activeStep, setActiveStep] = useState(0);
  const [selectedMaterial, setSelectedMaterial] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedModule, setSelectedModule] = useState("");
  const [showLowerPanel, setShowLowerPanel] = useState(false);
  const [showUpperPanel, setShowUpperPanel] = useState(true);
  const [selectedAccessories, setSelectedAccessories] = useState({
    "2 module": [],
    "4 module": [],
    "6 module": [],
    "8 module": [],
    "12 module": [],
  });
  const [accessoryIcons, setAccessoryIcons] = useState([]);
  const [selectedPanel, setSelectedPanel] = useState({
    code: "#000000",
    label: "Black",
  });
  const [selectedFrame, setSelectedFrame] = useState({
    code: "#000000",
    label: "Black",
  });
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [selectedRemote, setSelectedRemote] = useState("no");
  const [cartItems, setCartItems] = useState([]);
  const [adminItems, setAdminItems] = useState([]);
  const [imageSrc, setImageSrc] = useState(null);
  const [logoSelection, setLogoSelection] = useState("");

  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showLogo, setShowLogo] = useState(false);
  const [logoPosition, setLogoPosition] = useState('top-left');


  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setSelectedImage(file);
        
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target.result);
        };
        reader.readAsDataURL(file);
      } else {
        alert('Please select a valid image file');
      }
    }
  };

  const applyLogo = () => {
    if (selectedImage && imagePreview && logoPosition) {
      setShowLogo(true);
    } else {
      alert('Please select an image and position first');
    }
  };

  const removeLogo = () => {
    setShowLogo(false);
  };

 // Enhanced reset function
const resetAll = () => {
  setSelectedImage(null);
  setImagePreview(null);
  setShowLogo(false);
  setLogoPosition('top-left');
};

const getLogoPositionStyles = () => {
  const baseStyles = {
    position: 'absolute',
    width: '60px',
    height: '60px',
    objectFit: 'contain',
    border: '2px solid white',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
    backgroundColor: 'rgba(255,255,255,0.9)',
    backdropFilter: 'blur(4px)',
    zIndex: 10
  };

  const margin = 10; // Distance from edges

  switch (logoPosition) {
    case 'top-left':
      return { ...baseStyles, top: `${margin}px`, left: `${margin}px` };
    case 'top-right':
      return { ...baseStyles, top: `${margin}px`, right: `${margin}px` };
    case 'bottom-left':
      return { ...baseStyles, bottom: `${margin}px`, left: `${margin}px` };
    case 'bottom-right':
      return { ...baseStyles, bottom: `${margin}px`, right: `${margin}px` };
    default:
      return { ...baseStyles, top: `${margin}px`, left: `${margin}px` };
  }
};

  const gotostepper = async () => {
    setActiveStep(0);
    setCartItems([]);
    setSelectedModel("");
    setSelectedMaterial("");
    setSelectedModule("");
    setSelectedAccessories({
      "2 module": [],
      "4 module": [],
      "6 module": [],
      "8 module": [],
      "12 module": [],
    });
    setAccessoryIcons([]);
    setSelectedFrame({ code: "#000000", label: "Black" });
    setSelectedPanel({ code: "#000000", label: "Black" });
    setSelectedQuantity(1);
    setImageSrc(null);
    setSelectedRemote("no");
    setComponent("stepper");
  };

  const handleShowPanel = (panel) => {
    if(panel == 1){
      setShowUpperPanel(true);
      setShowLowerPanel(false);
    }else {
      setShowLowerPanel(true);
      setShowUpperPanel(false);
    }
  }

  const handleOrder = async () => {
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    let yPosition = 10; // Starting position on the page

    // Add order summary content
    for (const [index, item] of cartItems.entries()) {
      const orderSummary = document.getElementById(`order-summary-${index}`);
      if (!orderSummary) continue;

      // Render the order summary div
      const canvas = await html2canvas(orderSummary, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      // Check if the image fits on the current page
      if (yPosition + imgHeight > pdfHeight - 10) {
        pdf.addPage();
        yPosition = 10;
      }

      // Add the image to the PDF
      pdf.addImage(imgData, "PNG", 10, yPosition, pdfWidth - 20, imgHeight);
      yPosition += imgHeight + 10; // Add spacing between items
    }

    // Add heading for internal purpose
    if (yPosition + 20 > pdfHeight - 10) {
      // Check if there's space for the heading
      pdf.addPage();
      yPosition = 10;
    }
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    //pdf.text("For Internal Purpose Only", 10, yPosition);
    yPosition += 10;

    // Filter out the `image` key from cartItems
    const filteredCartItems = cartItems.map(
      ({ image, icons, ...rest }) => rest
    );
    //  const filteredImageItems = cartItems.map(({image, ...rest }) => image);

    // Serialize filteredCartItems to JSON (human-readable format)
    const jsonCartItems = JSON.stringify(filteredCartItems, null, 2); // Pretty-print JSON
    // const jsonImageItems = JSON.stringify(filteredImageItems, null, 2);

    // Add start marker
    pdf.setFont("courier", "normal");
    pdf.setFontSize(8);
   // pdf.text("===JSON START===", 10, yPosition);
    yPosition += 5;

    // Save the PDF
    pdf.save("Order_Summary.pdf");
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      alert("No items in the cart.");
      return;
    }
    setComponent("cart");
  };

  const handleDownload = async () => {
    if (divRef.current) {
      try {
        toPng(divRef.current)
          .then((dataUrl) => {
            setImageSrc(dataUrl); // Set the image source to the generated URL
          })
          .catch((err) => {
            console.error("Failed to convert div to image", err);
          });
        // Remove transform before capturing the SVG
        divRef.current.style.transform = "none";
        let bg = divRef.current.style.backgroundColor;
        divRef.current.style.backgroundColor = "transparent";
        let border = divRef.current.style.border;
        divRef.current.style.border = "2px solid black";
        let bs = divRef.current.style.boxShadow;
        divRef.current.style.boxShadow = "none";

        // Capture the SVG
        const svgData = await toSvg(divRef.current, {
          width: divRef.current.offsetWidth / 0.75,
          height: divRef.current.offsetHeight / 0.75,
        });

        // Capture the PNG
        const pngData = await toPng(divRef.current, {
          width: divRef.current.offsetWidth / 0.75,
          height: divRef.current.offsetHeight / 0.75,
        });

        // Reset transform to original value
        divRef.current.style.transform = "scale(0.75)";
        // let bg =   divRef.current.style.backgroundColor;
        divRef.current.style.backgroundColor = bg;
        //  let border = divRef.current.style.border;
        divRef.current.style.border = border;
        //  let bs = divRef.current.style.boxShadow;
        divRef.current.style.boxShadow = bs;

        // Download the SVG
        download(svgData, "my-div.svg");
        // Download the PNG
        download(pngData, "my-div.png");
      } catch (error) {
        console.error("Error generating SVG:", error);
      }
    }
  };

  const handleNext = () => {
    if (activeStep === 0 && !selectedModel) {
      alert("Cannot proceed without selecting a model");
      return;
    }
    if (activeStep === 1 && !selectedMaterial) {
      alert("Cannot proceed without selecting a material");
      return;
    }
    if (activeStep === 2 && !selectedModule) {
      alert("Cannot proceed without selecting a module");
      return;
    }
    if (activeStep !== steps.length - 1) {
      if(selectedModel == "Full Glass Touch"){
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
      } else {
        if(activeStep == 5){
          setActiveStep((prevActiveStep) => prevActiveStep + 2);
        } else {
          setActiveStep((prevActiveStep) => prevActiveStep + 1);
        }
      }
    } else {
      if (divRef.current) {
        toPng(divRef.current)
          .then((dataUrl) => {
            setImageSrc(dataUrl); // Set the image source to the generated URL
            let accesories = selectedAccessories[selectedModule].map(
              (acces) => {
                return { name: acces.name, icons: acces.icons };
              }
            );
            let item = {
              model: selectedModel,
              material: selectedMaterial,
              size: selectedModule,
              accessories: accesories,
              // fullaccessories: selectedAccessories[selectedModule],
              icons: accessoryIcons,
              panel: selectedPanel,
              frame: selectedFrame,
              image: dataUrl,
              quantity: selectedQuantity,
              remote: selectedRemote,
            };
            setCartItems((prevCartItems) => [...prevCartItems, item]);
          })
          .catch((err) => {
            console.error("Failed to convert div to image", err);
          });
      }
    }
  };

  const handleBack = () => {
    if(selectedModel == "Touch Plus" && activeStep == 7){
      setActiveStep((prevActiveStep) => prevActiveStep - 2);
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep - 1);
    }
  };

  const handleReset = () => {
    const userResponse = window.confirm(
      "This action will clear all your current selection.Are you sure you want to reset?"
    );
    if (userResponse) {
      //alert("You clicked OK!");
      setActiveStep(0);
      setSelectedModel("");
      setSelectedMaterial("");
      setSelectedModule("");
      setSelectedAccessories({
        "2 module": [],
        "4 module": [],
        "6 module": [],
        "8 module": [],
        "12 module": [],
      });
      setAccessoryIcons([]);
      setSelectedFrame({ code: "#000000", label: "Black" });
      setSelectedPanel({ code: "#000000", label: "Black" });
      setSelectedQuantity(1);
      setImageSrc(null);
      setSelectedRemote("no");
    } else {
      //alert("You clicked Cancel!");
    }
  };

  const handleMaterialSelect = (material) => {
    setSelectedMaterial(material);
  };

  const handleModelSelect = (model) => {
    setSelectedModel(model);
  };

  const handleModuleSelect = (module) => {
    setSelectedModule(module);
    setSelectedAccessories({
      "2 module": [],
      "4 module": [],
      "6 module": [],
      "8 module": [],
      "12 module": [],
    }); // Reset accessory selection when module changes
  };

  const handleAccessorySelect = (category, accessory, panelflag, showPanel) => {
    let totsize,totalAccesories = 0;
    let keys = Object.keys(selectedAccessories);
    for (let key of keys) {
      if (selectedAccessories[key].length) {
        if (showPanel) {
          if(showPanel)
          for (let acc of selectedAccessories[key]) {
             if(acc.showPanel == showPanel){
              if (acc.panelflag == panelflag) {
                totsize += acc.nodeSize;
              } else {
                alert("Select all items from either SET 1 or SET 2!!");
                return;
              }
            }
          }
        } else {
          for (let acc of selectedAccessories[key]) {
            totalAccesories = selectedAccessories[key].length;
            totsize += acc.nodeSize;
          }
        }
      }
    }
    totsize += accessory.nodeSize;
   // console.log(totsize);
    if (
      totalAccesories >=1
      // totsize >
      // moduleOptions.find((option) => option.label === selectedModule)
      //   .maxNodeSize
    ) {
      alert("Cannot select more than 1 accessory");
      return;
    } else {
      setSelectedAccessories((prevSelected) => {
        const categoryAccessories = prevSelected[category];
        let finalaccessory = accessory;
        let iconsarr = [];
        for (let ic of accessory.nodes) {
          let subnodes = [];
          for (let sub of ic.nodeClasses) {
            subnodes.push("");
          }
          iconsarr.push({ assets: subnodes });
        }
        if (panelflag) {
          finalaccessory = {
            ...accessory,
            showPanel: showPanel,
            panelflag: panelflag,
            icons: iconsarr,
          };
        } else {
          finalaccessory = { ...accessory, icons: iconsarr };
        }
        return {
          ...prevSelected,
          [category]: [...categoryAccessories, finalaccessory],
        };
        //}
      });
    }
  };

  // Handler for Remote Selection
  const handleRemoteChange = (event) => {
    setSelectedRemote(event.target.value);
  };

  // Handler for Quantity Change
  const handleQuantityChange = (event) => {
    const value = parseInt(event.target.value, 10);
    setSelectedQuantity(value > 0 ? value : 1); // Ensure the quantity is at least 1
  };

  const handleAdmin = () => {
    setComponent("admin");
    let adminItems = [];
    for (let item of cartItems) {
      let newaccessories = {
        "2 module": [],
        "4 module": [],
        "6 module": [],
        "8 module": [],
        "12 module": [],
      };
      for (let acc of item.accessories) {
        let obj = accessories[item.size].filter((i) => {
          if (i.name == acc.name) {
            return item;
          }
        })[0];
        newaccessories[item.size].push({ ...obj, icons: acc.icons });
      }
      adminItems.push({
        selectedModel: item.model,
        selectedMaterial: item.material,
        selectedModule: item.size,
        selectedAccessories: newaccessories,
        accessoryIcons: item.icons,
        selectedPanel: item.panel,
        selectedFrame: item.frame,
      });
    }
    setAdminItems(adminItems);
  };

  const handleAccessoryDelete = (category, accessory, indexToRemove = null) => {
    setSelectedAccessories(
      (prevSelected) => {
        const updatedAccessories = prevSelected[category].filter(
          (item, index) =>
            !(
              item.name === accessory.name &&
              (indexToRemove === null || index === indexToRemove)
            )
        );
        return {
          ...prevSelected,
          [category]: updatedAccessories,
        };
      },
      () => {
       // console.log(selectedAccessories);
      }
    );
    setAccessoryIcons((prevIcons) => {
      const updatedIcons = [...prevIcons];
      delete updatedIcons[indexToRemove];
      return updatedIcons;
    });
  };
  const handleIconDrop = (
    category,
    accessory,
    indexToRemove,
    icon,
    nodeIndex,
    subnodeIndex
  ) => {
    if (icon) {
      if (category) {
      }
      // console.log("In icon drop",category, accessory, indexToRemove, icon, selectedAccessories);
      setAccessoryIcons((prevIcons) => [...prevIcons, icon]);
      let oldlist = selectedAccessories;
      oldlist[category][indexToRemove].icons[nodeIndex].assets[subnodeIndex] =
        icon;
      setSelectedAccessories(oldlist);
    } else {
      if (category) {
        setSelectedAccessories(
          (prevSelected) => {
            const updatedAccessories = prevSelected[category].filter(
              (item, index) =>
                !(
                  item.name === accessory.name &&
                  (indexToRemove === null || index === indexToRemove)
                )
            );
            return {
              ...prevSelected,
              [category]: updatedAccessories,
            };
          },
          () => {
           // console.log(selectedAccessories);
          }
        );
      }
      setAccessoryIcons((prevIcons) => {
        const updatedIcons = [...prevIcons];
        delete updatedIcons[indexToRemove];
        return updatedIcons;
      });
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="headerdiv">
        <div style={{ width: "50%", textAlign: "left" }}>
          <span
            role="img"
            aria-label="person"
            style={{ fontSize: "24px" }}
           // onClick={handleAdmin}
          >
            👤
          </span>
        </div>
        <div style={{ width: "50%" }}>
          <CartDropdown cartItems={cartItems} handleCheckout={handleCheckout} />
        </div>
      </div>
      {component == "stepper" && (
        <div className="stepperdiv">
        <div>
        <Button color="primary" variant="contained" onClick={handleReset}>
              Reset Selection
            </Button>
        </div>
          <div className="stepsbar">
            <div style={{ alignItems: "center", display: "flex" }}>
              <div className="colorbar"></div>
              <span className="activestep">{steps[activeStep]}</span>
            </div>
            <Stepper activeStep={activeStep} className="">
              {steps.map((label, index) => (
                selectedModel == "Touch Plus" && index == 6 ? <></>:
                <Step key={index}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </div>
          <div className="mt-2 mb-4">
          {activeStep === 0 && (
              <div>
                {/* <Typography variant="h6" className="text-lg font-medium">Select material for your panel</Typography> */}
                <div
                  style={{
                    backgroundColor: "#efecec",
                    padding: "0.25rem",
                    borderRadius: "0.75rem",
                    gap: "0.75rem",
                    justifyContent: "center",
                    display: "inline-flex",
                  }}
                >
                  <div
                    // variant={selectedMaterial === 'Glass' ? 'contained' : 'outlined'}
                    onClick={() => handleModelSelect("Full Glass Touch")}
                    className={` materialbox ${
                      selectedModel === "Full Glass Touch"
                        ? "isSelected"
                        : "bg-white text-blue-500 border border-blue-500"
                    }`}
                  >
                    <p
                      style={{
                        fontSize: ".875rem",
                        fontWeight: "600",
                        color: "#6b7280",
                        lineHeight: "1.25rem",
                      }}
                    >
                      Model 1
                    </p>
                    <h2
                      style={{
                        fontSize: "1.875rem",
                        fontWeight: "700",
                        color: "#000",
                        lineHeight: "2.25rem",
                      }}
                    >
                      Full Glass Touch
                    </h2>
                  </div>
                  <div
                    // variant={selectedMaterial === 'Glass' ? 'contained' : 'outlined'}
                    onClick={() => handleModelSelect("Touch Plus")}
                    className={` materialbox ${
                      selectedModel === "Touch Plus"
                        ? "isSelected"
                        : "bg-white text-blue-500 border border-blue-500"
                    }`}
                  >
                    <p
                      style={{
                        fontSize: ".875rem",
                        fontWeight: "600",
                        color: "#6b7280",
                        lineHeight: "1.25rem",
                      }}
                    >
                      Model 2
                    </p>
                    <h2
                      style={{
                        fontSize: "1.875rem",
                        fontWeight: "700",
                        color: "#000",
                        lineHeight: "2.25rem",
                      }}
                    >
                      Touch Plus
                    </h2>
                  </div>
                  
                </div>
              </div>
            )}
            {activeStep === 1 && (
              <div>
                {/* <Typography variant="h6" className="text-lg font-medium">Select material for your panel</Typography> */}
                <div
                  style={{
                    backgroundColor: "#efecec",
                    padding: "0.25rem",
                    borderRadius: "0.75rem",
                    gap: "0.75rem",
                    justifyContent: "center",
                    display: "inline-flex",
                  }}
                >
                  <div
                    // variant={selectedMaterial === 'Glass' ? 'contained' : 'outlined'}
                    onClick={() => handleMaterialSelect("Glass")}
                    className={` materialbox ${
                      selectedMaterial === "Glass"
                        ? "isSelected"
                        : "bg-white text-blue-500 border border-blue-500"
                    }`}
                  >
                    <p
                      style={{
                        fontSize: ".875rem",
                        fontWeight: "600",
                        color: "#6b7280",
                        lineHeight: "1.25rem",
                      }}
                    >
                      Material 1
                    </p>
                    <h2
                      style={{
                        fontSize: "1.875rem",
                        fontWeight: "700",
                        color: "#000",
                        lineHeight: "2.25rem",
                      }}
                    >
                      Glass
                    </h2>
                  </div>
                  <div
                    // variant={selectedMaterial === 'Glass' ? 'contained' : 'outlined'}
                    onClick={() => handleMaterialSelect("Acrylic")}
                    className={` materialbox ${
                      selectedMaterial === "Acrylic"
                        ? "isSelected"
                        : "bg-white text-blue-500 border border-blue-500"
                    }`}
                  >
                    <p
                      style={{
                        fontSize: ".875rem",
                        fontWeight: "600",
                        color: "#6b7280",
                        lineHeight: "1.25rem",
                      }}
                    >
                      Material 2
                    </p>
                    <h2
                      style={{
                        fontSize: "1.875rem",
                        fontWeight: "700",
                        color: "#000",
                        lineHeight: "2.25rem",
                      }}
                    >
                      Acrylic
                    </h2>
                  </div>
                </div>
              </div>
            )}
            {activeStep === 2 && (
              <div>
                {/* <Typography variant="h6" className="text-lg font-medium">Select module size</Typography> */}
                <div
                  style={{
                    backgroundColor: "#efecec",
                    padding: "0.25rem",
                    borderRadius: "0.75rem",
                    gap: "0.75rem",
                    justifyContent: "center",
                    display: "inline-flex",
                    flexWrap: "wrap",
                  }}
                >
                  {moduleOptions.map((option, index) => (
                    <div
                      key={index}
                      // variant={selectedMaterial === 'Glass' ? 'contained' : 'outlined'}
                      onClick={() => handleModuleSelect(option.label)}
                      className={` materialbox ${
                        selectedModule === option.label
                          ? "isSelected"
                          : "bg-white text-blue-500 border border-blue-500"
                      }`}
                    >
                      <p
                        style={{
                          fontSize: ".875rem",
                          fontWeight: "600",
                          color: "#6b7280",
                          lineHeight: "1.25rem",
                        }}
                      >
                        Size {index + 1}
                      </p>
                      <h2
                        style={{
                          fontSize: "1.875rem",
                          fontWeight: "700",
                          color: "#000",
                          lineHeight: "2.25rem",
                        }}
                      >
                        {" "}
                        {option.label}
                      </h2>
                    </div>
                  ))}
                </div>
                {selectedModule && (
                  <div className={`mt-4 flex justify-center`}>
                    <div
                      id="panel"
                      className={`${
                        moduleOptions.find(
                          (option) => option.label === selectedModule
                        ).className
                      } ${selectedModel == "Touch Plus" ? "border-none" : "module-fsilver"}`}
                      style={{
                        boxShadow: "0 0 10px #888",
                        borderRadius: "10px",
                        overflow: "hidden",
                      }}
                    >
                        <div
                          className={`${
                            moduleOptions.find(
                              (option) => option.label === selectedModule
                            ).subclassName
                          }`}
                        ></div>
                    </div>
                  </div>
                )}
              </div>
            )}
            {activeStep === 3 && (
              <div className="flex">
                <div className="w-1/6">
                  {/* <Typography variant="h6" className="text-lg font-medium">Select an accessory</Typography> */}
                  {Object.entries(accessories).map(([category, items], index) =>
                    category == selectedModule ? (
                      <div key={index} className="mt-4">
                        <Typography
                          variant="subtitle1"
                          className="text-md font-medium"
                        >
                          {category}
                        </Typography>
                        {
                          items.map((item, subIndex) => (
                           selectedModel == "Touch Plus" && !item.tronixFlag ? <></> : 
                           selectedModel != "Touch Plus" && selectedModule == "12 module" && item.tronixFlag ? <></> : 
                           <Button
                              key={subIndex}
                              variant={
                                selectedAccessories[category].includes(item)
                                  ? "contained"
                                  : "outlined"
                              }
                              onClick={() =>
                                handleAccessorySelect(category, item, null, null)
                              }
                              className={`block w-full text-left mt-2 ${
                                selectedAccessories[category].includes(item)
                                  ? "bg-blue-500 text-white"
                                  : "bg-white text-blue-500 border border-blue-500"
                              }`}
                            >
                              {item.name}
                            </Button>
                          ))
                
                        }
                      </div>
                    ) : (
                      <></>
                    )
                  )}
                </div>
                <div className="w-5/6 flex justify-center items-center">
                  <div className="relative">
                    {selectedModule && (
                      <div className={`mt-4 flex justify-center`}>
                        <div
                          id="panel"
                          className={`${
                            moduleOptions.find(
                              (option) => option.label === selectedModule
                            ).className
                          } ${selectedModel == "Touch Plus" ? "border-none" : "module-fsilver"}`}
                          style={{
                            boxShadow: "0 0 10px #888",
                            borderRadius: "10px",
                            overflow: "hidden",
                          }}
                        >
                            <div
                              className={`${
                                moduleOptions.find(
                                  (option) => option.label === selectedModule
                                ).subclassName
                              }`}
                            >
                              {Object.entries(selectedAccessories).flatMap(
                                ([category, accessories]) =>
                                  accessories.map((accessory, index) => (
                                    <div
                                      key={`${category}-${accessory}-${index}`}
                                      className="absolute"
                                      style={{ position: "relative" }}
                                    >
                                      <div style={{ height: "100%" }}>
                                        <div
                                          className={`${accessory.className}`}
                                        >
                                          {accessory &&
                                            accessory.nodes.map((node) => (
                                              ((selectedModule == "12 module" && node.panel1 ) || selectedModule != "12 module") && <div className="nodeSize">
                                                { node.nodeClasses &&
                                                  node.nodeClasses.map(
                                                    (subnode) => (
                                                      <DroppableAccessory
                                                        noIcon={node.noIcon}
                                                        curnode={'1'}
                                                        subnode={subnode}
                                                        category={category}
                                                        accessory={accessory}
                                                        indexToRemove={index}
                                                        onDrop={
                                                          handleAccessoryDelete
                                                        }
                                                      />
                                                    )
                                                  )}
                                              </div>
                                            ))}
                                        </div>
                                        {selectedModule == "12 module" && <div
                                          className={`${accessory.className}`}
                                        >
                                          {accessory &&
                                            accessory.nodes.map((node) => (
                                              node.panel2 && <div className="nodeSize">
                                                { node.nodeClasses &&
                                                  node.nodeClasses.map(
                                                    (subnode) => (
                                                      <DroppableAccessory
                                                        noIcon={node.noIcon}
                                                        curnode={'2'}
                                                        subnode={subnode}
                                                        category={category}
                                                        accessory={accessory}
                                                        indexToRemove={index}
                                                        onDrop={
                                                          handleAccessoryDelete
                                                        }
                                                      />
                                                    )
                                                  )}
                                              </div>
                                            ))}
                                        </div>}
                                        <Button
                                          size="small"
                                          onClick={() =>
                                            handleAccessoryDelete(
                                              category,
                                              accessory,
                                              index
                                            )
                                          }
                                          className="absolute bottom-0 right-0 bg-red-500 text-white p-1"
                                        >
                                          <DeleteIcon
                                            className="delete"
                                            fontSize="small"
                                          />
                                        </Button>
                                      </div>
                                    </div>
                                  ))
                              )}
                            </div>
                          {/* )} */}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            {activeStep >= 4 && (
              <div>
                <div className="flex">
                  {activeStep != steps.length - 1 && (
                    <div
                      className="w-1/6"
                      style={{ overflow: "auto", height: "30rem" }}
                    >
                      {activeStep == 4 && (
                        <Typography
                          variant="h6"
                          className="text-lg font-medium"
                        >
                          Select icons
                        </Typography>
                      )}
                      {activeStep > 4 && activeStep != steps.length - 1 && (
                        <Typography
                          variant="h6"
                          className="text-lg font-medium"
                        >
                          Select Color
                        </Typography>
                      )}
                      {activeStep > 4 &&
                        activeStep != steps.length - 1 &&
                        colors.map((color, index) => (
                         (selectedModel == "Touch Plus" && !color.tronixFlag) || (selectedModel != "Touch Plus" && color.tronixFlag) ? <></> : 
                         <div>
                            <div
                              onClick={() => {
                                //console.log("I am in Color");
                                if (activeStep == 5) {
                                  let panel = document.getElementById("panel");
                                  panel.style.backgroundColor = color.code;
                                  setSelectedPanel(color);
                                } else {
                                  let panel = document.getElementById("panel");
                                  panel.style.border = `5px solid ${color.code}`;
                                  setSelectedFrame(color);
                                }
                              }}
                              key={index}
                              className="mt-4"
                              style={{
                                backgroundColor: `${color.code}`,
                                width: "5rem",
                                height: "5rem",
                                border: "2px solid black",
                                color: "#ffffff",
                              }}
                            ></div>
                            <div>{color.label}</div>
                          </div>
                        ))}
                      {activeStep == 4 &&
                        Object.entries(icons).map(
                          ([category, items], index) => (
                            <div key={index} className="mt-4">
                              <Typography
                                variant="subtitle1"
                                className="text-md font-medium"
                              >
                                {category}
                              </Typography>
                              <div className="grid grid-cols-2 gap-2">
                                {items.map((icon, subIndex) => (
                                  <DraggableIcon
                                    key={subIndex}
                                    icon={icon}
                                    index={subIndex}
                                  />
                                ))}
                              </div>
                            </div>
                          )
                        )}
                    </div>
                  )}
                  <div className="w-5/6 flex justify-center items-center">
                    <div className="relative">
                     
                        <div className={`mt-4 flex justify-center`}>
                          <div
                            ref={divRef}
                            id="panel"
                            className={`${
                              moduleOptions.find(
                                (option) => option.label === selectedModule
                              ).className
                            } ${selectedModel == "Touch Plus" ? "border-none" : "module-fsilver"}`}
                            style={{
                              boxShadow: "0 0 10px #888",
                              borderRadius: "10px",
                              overflow: "hidden",
                            }}
                          >
                              {/* Draggable Logo */}
          {showLogo && imagePreview && (
            <img
    src={imagePreview}
    alt="Logo"
    style={getLogoPositionStyles()}
  />
          )}
                            <div
                              className={`${
                                moduleOptions.find(
                                  (option) => option.label === selectedModule
                                ).subclassName
                              }`}
                            >
                              {Object.entries(selectedAccessories).flatMap(
                                ([category, accessories]) =>
                                  accessories.map((accessory, index) => (
                                    <div
                                      key={`${category}-${accessory}-${index}`}
                                      className="absolute"
                                      style={{ position: "relative" }}
                                    >
                                      <div style={{ height: "100%" }}>
                                        <div
                                          className={`${accessory.className}`}
                                        >
                                          {accessory &&
                                            accessory.nodes.map(
                                              (node, nodeIndex) => (
                                               ((selectedModule == '12 module' && node.panel1) || selectedModule != '12 module') &&
                                               <div className="nodeSize">
                                                  {node.nodeClasses &&
                                                    node.nodeClasses.map(
                                                      (
                                                        subnode,
                                                        subnodeIndex
                                                      ) => (
                                                        <DroppableAccessory
                                                          noIcon={node.noIcon}
                                                          curnode={'1'}
                                                          subnode={subnode}
                                                          nodeIndex={nodeIndex}
                                                          subnodeIndex={
                                                            subnodeIndex
                                                          }
                                                          category={category}
                                                          accessory={accessory}
                                                          indexToRemove={index}
                                                          onDrop={
                                                            handleIconDrop
                                                          }
                                                          activeStep={
                                                            activeStep
                                                          }
                                                        />
                                                      )
                                                    )}
                                                </div>
                                              )
                                            )}
                                        </div>
                                        {selectedModule == "12 module" && 
                                          <div
                                          className={`${accessory.className}`}
                                        >
                                          {accessory &&
                                            accessory.nodes.map(
                                              (node, nodeIndex) => (
                                                node.panel2 &&
                                                <div className="nodeSize">
                                                  {node.nodeClasses &&
                                                    node.nodeClasses.map(
                                                      (
                                                        subnode,
                                                        subnodeIndex
                                                      ) => (
                                                        <DroppableAccessory
                                                          noIcon={node.noIcon}
                                                          curnode={'2'}
                                                          subnode={subnode}
                                                          nodeIndex={nodeIndex}
                                                          subnodeIndex={
                                                            subnodeIndex
                                                          }
                                                          category={category}
                                                          accessory={accessory}
                                                          indexToRemove={index}
                                                          onDrop={
                                                            handleIconDrop
                                                          }
                                                          activeStep={
                                                            activeStep
                                                          }
                                                        />
                                                      )
                                                    )}
                                                </div>
                                              )
                                            )}
                                        </div>
                                        }
                                        {/* <Button
                                          size="small"
                                          onClick={() =>
                                            handleAccessoryDelete(
                                              category,
                                              accessory,
                                              index
                                            )
                                          }
                                          className="absolute bottom-0 right-0 bg-red-500 text-white p-1"
                                        >
                                          {activeStep == 3 && (
                                            <DeleteIcon
                                              className="delete"
                                              fontSize="small"
                                            />
                                          )}
                                        </Button> */}
                                      </div>
                                    </div>
                                  ))
                              )}
                            </div>
                          </div>
                        </div>
                    
                    </div>
                  </div>
                  {activeStep == steps.length - 1 && (
                    <div style={{ width: "100%", display: "flex" }}>
                      <div className="orderBox">
                        <div
                          style={{
                            fontSize: "1.25rem",
                            lineHeight: "1.75rem",
                            fontWeight: "700",
                          }}
                        >
                          Order Summary
                        </div>
                        <div style={{ fontSize: ".75rem" }}>Model</div>
                        <div className="orderFont">{selectedModel}</div>
                        <div style={{ fontSize: ".75rem" }}>Material</div>
                        <div className="orderFont">{selectedMaterial}</div>
                        <div style={{ fontSize: ".75rem" }}>Size</div>
                        <div className="orderFont">{selectedModule}</div>
                        <div style={{ fontSize: ".75rem" }}>Accessories</div>
                        <div className="orderFont">
                          {selectedAccessories &&
                            selectedAccessories[selectedModule] &&
                            selectedAccessories[selectedModule][0] &&
                            selectedAccessories[selectedModule][0].name}
                        </div>
                        <div style={{ fontSize: ".75rem" }}>Color</div>
                        <div className="orderFont">
                          Panel Color -{" "}
                          <span
                            style={{
                              color: `${
                                selectedPanel && selectedPanel.code == "#ffffff"
                                  ? "#000000"
                                  : "#ffffff"
                              }`,
                              border: `${
                                selectedPanel && selectedPanel.code == "#ffffff"
                                  ? "1px solid #000000"
                                  : "none"
                              }`,
                              backgroundColor: `${
                                selectedPanel && selectedPanel.code
                                  ? selectedPanel.code
                                  : "#000000"
                              }`,
                            }}
                          >
                            {selectedPanel && selectedPanel.label
                              ? selectedPanel.label
                              : "Black"}
                          </span>
                        </div>
                        {selectedModel == "Full Glass Touch" && <div className="orderFont">
                          Frame Color -{" "}
                          <span
                            style={{
                              color: "#ffffff",
                              backgroundColor: `${
                                selectedFrame && selectedFrame.code
                                  ? selectedFrame.code
                                  : "#000000"
                              }`,
                            }}
                          >
                            {selectedFrame && selectedFrame.label
                              ? selectedFrame.label
                              : "Black"}
                          </span>
                        </div>}
                        {/* Logo */}
                       <div>
                        <h2>Logo Uploader</h2>
                        <div>
                          <h3>Upload Image</h3>
                          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                          <div>
                          <Upload className="w-8 h-8 mb-2 text-gray-400" />
                          <p className="text-sm text-gray-500">Click to upload image</p>
                          <p className="text-xs text-gray-400">PNG, JPG, GIF up to 10MB</p>
                          </div>
                        <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
                          </label>
                          {imagePreview && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">Preview:</p>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-20 h-20 object-contain border rounded-lg bg-gray-50"
                  />
                </div>
              )}
               {/* Position Selection Dropdown */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Logo Position:
        </label>
        <select
          value={logoPosition}
          onChange={(e) => setLogoPosition(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="top-left">Top Left</option>
          <option value="top-right">Top Right</option>
          <option value="bottom-left">Bottom Left</option>
          <option value="bottom-right">Bottom Right</option>
        </select>
      </div>
               {/* Action Buttons */}
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={applyLogo}
            disabled={!selectedImage}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            <FileImage className="w-4 h-4" />
            Apply Logo
          </button>
          
          {showLogo && (
            <button
              onClick={removeLogo}
              className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Remove Logo
            </button>
          )}

        <button
          onClick={resetAll}
          className="flex items-center gap-2 px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Reset All
        </button>
        </div>
                       </div>
                       </div>
                       

                        {/* New Options */}
                        <div className="orderfooter">
                          {/* Remote Selection */}
                          <div style={{ fontSize: ".875rem" }}>
                            <label>
                              Remote:{" "}
                              <select
                                value={selectedRemote}
                                onChange={handleRemoteChange}
                                className="remote"
                              >
                                <option value="yes">Yes</option>
                                <option value="no">No</option>
                              </select>
                            </label>
                          </div>
                          {/* Quantity Selection */}
                          <div style={{ fontSize: ".875rem" }}>
                            <label>
                              Quantity:{" "}
                              <input
                                type="number"
                                min="1"
                                value={selectedQuantity}
                                onChange={handleQuantityChange}
                                className="quantity"
                              />
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="flex flex-row pt-2">
            {/* <Button color="primary" variant="contained" onClick={handleReset}>
              Reset
            </Button> */}
            <Button
              color="inherit"
              variant="outlined"
              disabled={activeStep === 0}
              onClick={handleBack}
              className="mr-2"
            >
              Back
            </Button>
            <div className="flex-1" />
            <Button onClick={handleNext} variant="outlined">
              {activeStep === steps.length - 1 ? "Add to Cart" : "Next"}
            </Button>
          </div>
        </div>
      )}
      {component == "cart" && (
        <div className="stepperdiv">
          <div>Cart Items</div>
          <div style={{ padding: "10px" }}>
            {cartItems.length > 0 ? (
              <>
                <div>
                  {cartItems.map((item, index) => (
                    <div id={`order-summary-${index}`}>
                      <div key={index} className="orderSummary">
                        {/* Left Section: Order Details */}
                        <div
                          style={{
                            flex: 1,
                            marginRight: "1rem",
                            width: "30%",
                            lineHeight: "1.5rem",
                          }}
                        >
                          <div
                            style={{ fontSize: "1.2rem", fontWeight: "700" }}
                          >
                            Order {index + 1}
                          </div>
                          <div style={{ fontSize: "1rem", marginTop: ".5rem" }}>
                            <strong>Material:</strong> {item.material}
                          </div>
                          <div style={{ fontSize: "1rem" }}>
                            <strong>Size:</strong> {item.size}
                          </div>
                          <div style={{ fontSize: "1rem" }}>
                            <strong>Accessories:</strong>{" "}
                            {item.accessories.map((acc) => acc.name + ",  ")}
                          </div>
                          {/* <div style={{ fontSize: "1rem" }}>
                            <strong>Icons:</strong>
                             {JSON.stringify(item.icons)}
                          </div> */}
                          <div className="panel" style={{marginTop:10}}>
                            <strong>Panel Color:</strong>{" "}
                            <div
                              style={{
                                color:'#ffffff',
                                paddingLeft: 10,
                                paddingRight: 10,
                                paddingTop:3,
                                marginLeft: 5,
                                backgroundColor: `${
                                  item.panel && item.panel.code
                                    ? item.panel.code
                                    : "#000000"
                                }`,
                              }}
                            >{item.panel.label}</div>
                            {/* {item.panel.label} */}
                          </div>
                          <div className="panel" style={{marginTop:10}}>
                            <strong>Frame Color:</strong>{" "}
                            <div
                              style={{
                                color:'#ffffff',
                                paddingLeft: 10,
                                paddingRight: 10,
                                paddingTop:3,
                                marginLeft: 5,
                                backgroundColor: `${
                                  item.frame && item.frame.code
                                    ? item.frame.code
                                    : "#000000"
                                }`,
                              }}
                            > {item.frame.label}</div>
                           
                          </div>
                          <div style={{ fontSize: "1rem" }}>
                            <strong>Quantity:</strong> {item.quantity}
                          </div>
                          <div style={{ fontSize: "1rem" }}>
                            <strong>Remote:</strong> {item.remote}
                          </div>
                        </div>
                        <div style={{ width: "70%" }}>
                          <img src={item.image} alt="Cart Item" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Checkout Button */}
                <div style={{ textAlign: "center", marginTop: "1rem" }}>
                  <button style={{marginRight: 10}} className="newOrder" onClick={handleOrder}>
                    Download Order
                  </button>
                  <button className="newOrder" onClick={gotostepper}>
                    New Order
                  </button>
                </div>
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "10px" }}>
                No items in the cart.
              </div>
            )}
          </div>
        </div>
      )}

      {component == "admin" && (
        <div className="stepperdiv">
          {adminItems &&
            adminItems.map((adminitem) => (
              <div className="w-5/6 flex justify-center items-center">
                <div className="relative">
                  {adminitem.selectedModule &&
                 
                   (
                    <div className={`mt-4 flex justify-center`}>
                      <div
                        ref={divRef}
                        id="panel"
                        className={`${
                          moduleOptions.find(
                            (option) =>
                              option.label === adminitem.selectedModule
                          ).className
                        } ${adminitem.selectedModel == "Touch Plus" ? "border-none" : "module-fsilver"}`}
                        style={{
                          boxShadow: "0 0 10px #888",
                          borderRadius: "10px",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          className={`${
                            moduleOptions.find(
                              (option) =>
                                option.label === adminitem.selectedModule
                            ).subclassName
                          }`}
                        >
                          {Object.entries(
                            adminitem.selectedAccessories
                          ).flatMap(([category, accessories]) =>
                            accessories.map((accessory, index) => (
                              <div
                                key={`${category}-${accessory}-${index}`}
                                className="absolute"
                                style={{ position: "relative" }}
                              >
                                <div style={{ height: "100%" }}>
                                  <div className={`${accessory.className}`}>
                                    {accessory &&
                                      accessory.nodes.map((node, nodeIndex) => (
                                        <div className="nodeSize">
                                          {node.nodeClasses &&
                                            node.nodeClasses.map(
                                              (subnode, subnodeIndex) => (
                                                <DroppableAccessory
                                                  noIcon={node.noIcon}
                                                  curnode={node}
                                                  subnode={subnode}
                                                  nodeIndex={nodeIndex}
                                                  subnodeIndex={subnodeIndex}
                                                  category={category}
                                                  accessory={accessory}
                                                  indexToRemove={index}
                                                  onDrop={handleIconDrop}
                                                  activeStep={activeStep}
                                                />
                                              )
                                            )}
                                        </div>
                                      ))}
                                  </div>
                                  <Button
                                    size="small"
                                    onClick={() =>
                                      handleAccessoryDelete(
                                        category,
                                        accessory,
                                        index
                                      )
                                    }
                                    className="absolute bottom-0 right-0 bg-red-500 text-white p-1"
                                  >
                                    {activeStep == 3 && (
                                      <DeleteIcon
                                        className="delete"
                                        fontSize="small"
                                      />
                                    )}
                                  </Button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
        </div>
      )}
    </DndProvider>
  );
};

export default StepperComponent;
