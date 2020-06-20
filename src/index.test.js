import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";

import {parseParametricSVG, ParametricSVG} from "./index";

const defaultSVGString = `<svg  version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        xmlns:parametric="https://parametric-svg.github.io/v0.2"
        width="500"
        height="500"
        parametric:defaults="x=60;y=60;d=5">
<circle parametric:cx="{x + d}" parametric:cy="{y}" r="40" stroke="black" stroke-width="3" fill="blue" />
<circle parametric:cx="{x}" parametric:cy="{y}" r="40" stroke="black" stroke-width="3" fill="green" />
</svg>`;


// See https://reactjs.org/docs/testing-recipes.html#setup--teardown
let container = null;
beforeEach(() => {
  // setup a DOM element as a render target
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  // cleanup on exiting
  unmountComponentAtNode(container);
  container.remove();
  container = null;
});



test('identifies params', () => {
    const res = parseParametricSVG(defaultSVGString);

    const params = Object.keys(res.parameters);
    params.sort();
    expect(params).toStrictEqual(['d', 'x', 'y']);
});

test('identifies default params', () => {
    const res = parseParametricSVG(defaultSVGString);

    const params = Object.keys(res.defaultParameters);
    params.sort();
    expect(params).toStrictEqual(['d', 'x', 'y']);

    expect(res.defaultParameters.d).toBe("5");
    expect(res.defaultParameters.x).toBe("60");
    expect(res.defaultParameters.y).toBe("60");
});


it("renders with no params specified", () => {
  act(() => {    render(<ParametricSVG svgString={defaultSVGString} />, container);  });
  const expectedResult = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:parametric="https://parametric-svg.github.io/v0.2" width="500" height="500" parametric:defaults="x=60;y=60;d=5" defaults="x=60;y=60;d=5"><circle parametric:cx="{x + d}" cx="65" parametric:cy="{y}" cy="60" r="40" stroke="black" stroke-width="3" fill="blue"></circle><circle parametric:cx="{x}" cx="60" parametric:cy="{y}" cy="60" r="40" stroke="black" stroke-width="3" fill="green"></circle></svg>';
  expect(container.innerHTML).toBe(expectedResult);
});

it('renders with a defualt param replaced', ()=>{
      act(() => {    render(<ParametricSVG svgString={defaultSVGString} params={{d: 100}} />, container);  });
      const expectedResult = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:parametric="https://parametric-svg.github.io/v0.2" width="500" height="500" parametric:defaults="x=60;y=60;d=5" defaults="x=60;y=60;d=5"><circle parametric:cx="{x + d}" cx="160" parametric:cy="{y}" cy="60" r="40" stroke="black" stroke-width="3" fill="blue"></circle><circle parametric:cx="{x}" cx="60" parametric:cy="{y}" cy="60" r="40" stroke="black" stroke-width="3" fill="green"></circle></svg>';
      expect(container.innerHTML).toBe(expectedResult);
});

it("renders with innerOnly=true", () => {
  act(() => {render(<svg><g><ParametricSVG svgString={defaultSVGString} innerOnly={true}/></g></svg>, container);  });
  const expectedResult = '<svg><g><circle parametric:cx="{x + d}" cx="65" parametric:cy="{y}" cy="60" r="40" stroke="black" stroke-width="3" fill="blue"></circle><circle parametric:cx="{x}" cx="60" parametric:cy="{y}" cy="60" r="40" stroke="black" stroke-width="3" fill="green"></circle></g></svg>';
  expect(container.innerHTML).toBe(expectedResult);
});

it("renders with innerOnly=true and params replaced", () => {
  act(() => {render(<svg><g><ParametricSVG svgString={defaultSVGString} innerOnly={true} params={{d: 100}} /></g></svg>, container);  });
  const expectedResult = '<svg><g><circle parametric:cx="{x + d}" cx="160" parametric:cy="{y}" cy="60" r="40" stroke="black" stroke-width="3" fill="blue"></circle><circle parametric:cx="{x}" cx="60" parametric:cy="{y}" cy="60" r="40" stroke="black" stroke-width="3" fill="green"></circle></g></svg>';
  expect(container.innerHTML).toBe(expectedResult);
});


// This test complains about the case of some of the created tags
// but container.innerHTML has correct capitalisation
it("renders a fragment without an SVG tag", () => {
    const defaultSVGString2 = `
    <circle parametric:cx="{x + d}" parametric:cy="{y}" r="40" stroke="black" stroke-width="3" fill="blue" />
    <circle parametric:cx="{x}" parametric:cy="{y}" r="40" stroke="black" stroke-width="3" fill="green" />`;

  act(() => { render(<ParametricSVG svgString={defaultSVGString2} params={{x: 60, y:60, d: 5}} />, container); });

  const expectedResult = '<svg id="VIRTUAL-SVG"><circle parametric:cx="{x + d}" cx="65" parametric:cy="{y}" cy="60" r="40" stroke="black" stroke-width="3" fill="blue"><circle parametric:cx="{x}" cx="60" parametric:cy="{y}" cy="60" r="40" stroke="black" stroke-width="3" fill="green"></circle></circle></svg>';
  expect(container.innerHTML).toBe(expectedResult);
});


it("test catch exception", () => {
    // Here d has no default value and is not set in params, so evaluating cx fails
    // the test checks that this error is caught and cx set to "null"
    const defaultSVGString2 = `
    <circle parametric:cx="{x + d}" parametric:cy="{y}" r="40" stroke="black" stroke-width="3" fill="blue" />
    <circle parametric:cx="{x}" parametric:cy="{y}" r="40" stroke="black" stroke-width="3" fill="green" />`;

  act(() => { render(<ParametricSVG svgString={defaultSVGString2} params={{x: 60, y:60}} />, container); });

  const expectedResult = '<svg id="VIRTUAL-SVG"><circle parametric:cx="{x + d}" cx="null" parametric:cy="{y}" cy="60" r="40" stroke="black" stroke-width="3" fill="blue"><circle parametric:cx="{x}" cx="60" parametric:cy="{y}" cy="60" r="40" stroke="black" stroke-width="3" fill="green"></circle></circle></svg>';
  expect(container.innerHTML).toBe(expectedResult);
});
