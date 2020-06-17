import React, {useEffect} from 'react';
import * as math from 'mathjs';


const processExpressionTerm = (term, parameters) => {
    const expression = term
        .replace(/{/g, '')
        .replace(/\(/g, '')
        .replace(/\)/g, '')
        .replace(/}/g, '')
        .replace(/\+/g, ' ')
        .replace(/-/g, ' ')
        .replace(/\^/g, ' ')
        .replace(/\//g, ' ')
        .replace(/\*/g, ' ')
        .replace(/,/g, ' ')
        .replace(/'/g, ' ');

    const terms = expression.split(" ");

    for (let term in terms) {
        if (!terms[term] || !isNaN(terms[term])) {
            continue;
        }

        if (!parameters[terms[term]]) {
            parameters[terms[term]] = 0;
        }
    }

    return parameters;
}

const getParameters = (attributes, parameters) => {
    // Given a NamedNodeMap or Array of attributes for a tag, identify any parameters not recorded in the parameters array

    if (!attributes) {
        return;
    }

    // process only the contents of {}
    const re = /\{(.+?)\}/g;


    for (let j = 0; j < attributes.length; j++) {
        const attribute = attributes[j];

        if (attribute.name.startsWith("parametric:")) {
            attribute.nodeValue.replace(re, (match, g1, g2) => {
                parameters = processExpressionTerm(g1, parameters);
            });
        }
    }
};


const getDefaultParamValues = (svg, defaultParameters) => {
    const defaultAttribute = svg.attributes["parametric:defaults"];
    if (defaultAttribute) {
        let assignments = defaultAttribute.nodeValue.split(";");
        let param, value;
        for (let i in assignments) {
            [param, value] = assignments[i].split("=");
            param = param.trim();
            defaultParameters[param] = value;
        }
    }

    return defaultParameters;
}

const getTree = (parentNode) => {
    const childrenArray = [].slice.call(parentNode.children)
    const children = childrenArray.map(child => getTree(child));

    return {
        tagName: parentNode.tagName,
        id: parentNode.id,
        className: parentNode.className,
        attributes: [...parentNode.attributes].map(d =>
            ({name: d.name, value: d.value})),
        children: children
    };
}

// This is the intended entrypoint for the parametric SVG editor
const parseParametricSVG = (svgString) => {
    var virtualParent = document.createElement('div'); // can't set outerHTML of an element with no parent
    var virtualSVG = document.createElement('svg');
    virtualSVG.id = 'VIRTUAL-SVG';

    virtualParent.appendChild(virtualSVG);

    if (svgString.includes("<svg")) {
        virtualSVG.outerHTML = svgString;
    } else {
        virtualSVG.innerHTML = svgString;
    }
    virtualSVG = virtualParent.lastChild;

    let parameters = {};
    let defaultParameters = {};

    let children = virtualSVG.childNodes;
    for (let i = 0; i < children.length; i++) {
        getParameters(children[i].attributes, parameters);
    }

    defaultParameters = getDefaultParamValues(virtualSVG, defaultParameters);

    // Construct tree in JSON reflecting tree in SVG
    const tree = getTree(virtualSVG);

    return {parameters, defaultParameters, tree};
}


///


const re = /\{(.+?)\}/g;

const Element = ({tree, params, defaultParams}) => {
    var attributes = {};
    const attribute_names = tree.attributes.map(d => d.name);

    const camelCase = (name) => (
        name.split('-')
             .map((item, index) => index ? item.charAt(0).toUpperCase() + item.slice(1).toLowerCase() : item)
             .join("")
    );

    for (let i in tree.attributes) {
        let name = tree.attributes[i].name;
        let value = tree.attributes[i].value;


        if (name && name.startsWith("parametric:")) {

            attributes[name] = value; // save the parametric version

            value = value.replace(re, function (match, g1, g2) {
                try {
                    return math.evaluate(g1, params)
                } catch (err) {
                    return null;
                }

            });
            attributes[camelCase(name.replace('parametric:', ''))] = value; // save version with paramater values substituted
        } else if (!attribute_names.includes('parametric:' + name)) {
            attributes[camelCase(name)] = value;
        } else {
            // this is the non-parametric version of an attribute: don't replace value substituted above
        }
    }

    const childTags = tree.children.map( (child, i) => <Element tree={child} params={params} defaultParams={defaultParams} key={i} />);
    return React.createElement(tree.tagName, attributes, childTags);
};


const PreviewSVG = ({params, defaultParams, tree, updateSVGString}) => {
    useEffect(() => {if (updateSVGString){ updateSVGString()}});
    return <Element tree={tree} params={params} defaultParams={defaultParams}/>;
};


// This is the entrypoint if you just want to render a parametric SVG
const ParametricSVG = ({svgString, params, onParse, innerOnly}) => {
    const {parameters, defaultParameters: defaultParams, tree} = parseParametricSVG(svgString);

    if (onParse){
        onParse(parameters, defaultParams);
    }

    if (innerOnly){
        return <>{tree.children.map( (child, i) => <Element tree={child} params={{...defaultParams, ...(params || {})}} defaultParams={defaultParams} key={i} />)}</>
    } else {
        return <Element tree={tree} params={{...defaultParams, ...(params || {})}} defaultParams={defaultParams}/>;
    }
}

export {ParametricSVG, parseParametricSVG, PreviewSVG};
