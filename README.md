# React parametric SVG

This is a [React](https://reactjs.org/) component to render a parametric SVG.

It should be considered at an early stage of development, and may contain bugs.

Install using `npm install react-parametric-svg`.

## Usage


Render using default parameter values:

```jsx
import React from 'react';
import {ParametricSVG} from 'react-parametric-svg';

const ExampleComponent = () => {
    const defaultSVGString = `<svg  version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        xmlns:parametric="https://parametric-svg.github.io/v0.2"
        width="500"
        height="500"
        parametric:defaults="x=60;y=60;d=5">
        <circle parametric:cx="{x + d}" parametric:cy="{y}" r="40" stroke="black" stroke-width="3" fill="blue" />
        <circle parametric:cx="{x}" parametric:cy="{y}" r="40" stroke="black" stroke-width="3" fill="green" />
        </svg>`;

    return <ParametricSVG svgString={defaultSVGString} />;
}

```

You can provide an object of values for the parameters (you don't need to specify values for all of them, as the values you provide will be merged with the defaults specified in the SVG):

```jsx
<ParametricSVG svgString={defaultSVGString} params={{d: 100}} />
```

You can set `innerOnly={true}` to render just the contents of the SVG, not the actual SVG element itself.
This allows you to combine several parametric SVGs into a single SVG:

```jsx

<svg width="400" height="400">
    <g transform="translate(0, 0)">
        <ParametricSVG svgString={defaultSVGString} params={{d: 25}} innerOnly={true}/>
    </g>
    <g transform="translate(0, 100)">
        <ParametricSVG svgString={defaultSVGString} params={{d: 50}} innerOnly={true}/>
    </g>
    <g transform="translate(0, 200)">
        <ParametricSVG svgString={defaultSVGString} params={{d: 100}} innerOnly={true}/>
    </g>
</svg>
```