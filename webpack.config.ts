import * as CONFIG from "./src/config";
import * as path from "path";
import Sass from "node-sass";
const SassUtils = require("node-sass-utils")(Sass);

// Order is important: mjs must come before js to enable tree-shaking for dual-mode ESM/CJS packages.
const EXTENSIONS = ["ts", "tsx", "mjs", "js", "jsx", "scss"];
const EXTENSIONS_TS = ["ts", "tsx"];
const REGEX_SOURCE_CODE_TS = new RegExp("\\.(" + EXTENSIONS_TS.join("|") + ")$");
const DIR_SOURCE = "src";

// Function declaration notation does not work because SassUtils is undefined then.
const toSassDimension = (s: string): any => {
    const cssUnits = ["rem","em","vh","vw","vmin","vmax","ex","%","px","cm","mm","in","pt","pc","ch"];
    const parts = s.match(/^([\.0-9]+)([a-zA-Z]+)$/);
    if (parts === null) {
        return s;
    }
    const num = parts[1];
    const unit = parts[2];
    if (cssUnits.includes(unit)) {
        return new SassUtils.SassDimension(parseInt(num, 10), unit);
    }
    return s;
};

const toSassDimensionRecursively = (x: any): any => {
    if (typeof x === "string") {
        return toSassDimension(x);
    } else if (typeof x === "object") {
        const result: any = {};
        Object.keys(x).forEach(key => {
            result[key] = toSassDimensionRecursively(x[key]);
        });
        return result;
    } else {
        return x;
    }
};

const SASS_VARS = toSassDimensionRecursively({
    CONFIG,
});

export default {
    mode: "production",
    entry: {
        index: "./src/index.ts",
    },
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "index.js",
        library: "better-sweclockers-lib",
        libraryTarget: "umd",
    },
    module: {
        rules: [
            {
                test: /\.scss$/,
                loaders: [
                    {
                        loader: "to-string-loader",
                    },
                    {
                        loader: "css-loader",
                    },
                    {
                        loader: "sass-loader",
                        options: {
                            functions: {
                                getGlobal: (keyString: any) => {
                                    function fail(input: any) {
                                        throw new TypeError(`Expected a string, but saw ${input}`);
                                    }
                                    if (keyString.getValue === undefined) { fail("nothing"); }
                                    const value = keyString.getValue();
                                    if (typeof value !== "string") { fail(value); }
                                    function dig(obj: any, keys: string[]): any {
                                        if (keys.length === 0) {
                                            return obj;
                                        } else {
                                            const deeper = obj[keys[0]];
                                            if (deeper === undefined) {
                                                throw new Error(`Unknown global: '${value}' (failed on '${keys[0]}')`);
                                            }
                                            return dig(deeper, keys.slice(1));
                                        }
                                    }
                                    return SassUtils.castToSass(dig(SASS_VARS, value.split(".")));
                                },
                            },
                        },
                    },
                ],
            },
            {
                loaders: [
                    {
                        loader: "awesome-typescript-loader",
                    },
                ],
                include: [
                    path.resolve(__dirname, DIR_SOURCE),
                ],
                test: REGEX_SOURCE_CODE_TS,
            },
        ],
    },
    resolve: {
        modules: [ "node_modules" ],
        extensions: EXTENSIONS.map(e => "."+e).concat(["*"]),
    },
};
