import { IsNumber, IsString, IsTuple } from "@paulpopat/safe-type";
import { CssProperty } from "Src/CSS";

const IsRgb = IsTuple(IsNumber, IsNumber, IsNumber);
const IsRgba = IsTuple(IsNumber, IsNumber, IsNumber, IsNumber);

type ColourObject = {
  readonly r: number;
  readonly g: number;
  readonly b: number;
  readonly a: number;
};

type ColourArg =
  | string
  | [number, number, number]
  | [number, number, number, number]
  | Colour
  | ColourObject;

function ToString(colour: ColourObject) {
  return `rgba(${colour.r}, ${colour.g}, ${colour.b}, ${colour.a})`;
}

function ParseNumberString(data: string) {
  const parse_char = (data: string) =>
    data === "0" ? 0 : parseInt(data, 16) + 1;

  let result = 0;
  for (let i = 0; i < data.length; i++)
    result += parse_char(data[i]) * Math.max(1, 16 * (data.length - i - 1));

  return result;
}

export default class Colour extends CssProperty {
  private readonly colour: ColourObject;
  private readonly text: ColourObject | undefined;

  public constructor(colour: ColourArg, text?: ColourArg) {
    super();
    this.colour = this.ParseColour(colour);
    this.text = text ? this.ParseColour(text) : undefined;
  }

  ParseColour(colour: ColourArg): ColourObject {
    if (IsString(colour)) {
      if (colour.match(/^\#[0-9a-f][0-9a-f][0-9a-f]$/gm))
        return {
          get r() {
            return ParseNumberString(colour[1]) * 16;
          },
          get g() {
            return ParseNumberString(colour[2]) * 16;
          },
          get b() {
            return ParseNumberString(colour[3]) * 16;
          },
          get a() {
            return 1;
          },
        };

      if (
        colour.match(/^\#[0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f]$/gm)
      )
        return {
          get r() {
            return ParseNumberString(colour[1] + colour[2]);
          },
          get g() {
            return ParseNumberString(colour[3] + colour[4]);
          },
          get b() {
            return ParseNumberString(colour[5] + colour[6]);
          },
          get a() {
            return 1;
          },
        };

      throw new Error("Invalid hex colour of " + colour);
    } else if (IsRgb(colour))
      return {
        get r() {
          return colour[0];
        },
        get g() {
          return colour[1];
        },
        get b() {
          return colour[2];
        },
        get a() {
          return 1;
        },
      };

    if (IsRgba(colour))
      return {
        get r() {
          return colour[0];
        },
        get g() {
          return colour[1];
        },
        get b() {
          return colour[2];
        },
        get a() {
          return colour[3];
        },
      };

    if (colour instanceof Colour)
      return {
        get r() {
          return colour.colour.r;
        },
        get g() {
          return colour.colour.g;
        },
        get b() {
          return colour.colour.b;
        },
        get a() {
          return colour.colour.a;
        },
      };

    if (typeof colour === "object") return colour;

    throw new Error("Invalid hex colour of " + colour);
  }

  public get Text(): ColourObject {
    if (this.text) return this.text;
    const brightness = Math.round(
      (this.colour.r * 299 + this.colour.g * 587 + this.colour.b * 114) / 1000
    );

    return brightness > 125 ? Colour.TextDark : Colour.TextLight;
  }

  public GreyscaleTransform(amount: number) {
    return new Colour([
      this.colour.r * (amount / 100),
      this.colour.g * (amount / 100),
      this.colour.b * (amount / 100),
    ]);
  }

  public override get Properties() {
    return [
      { name: "color", value: ToString(this.Text) },
      { name: "background-color", value: ToString(this.colour) },
    ];
  }

  public get Hex() {
    return ToString(this.colour);
  }

  public static TextDark = { r: 0, g: 0, b: 0, a: 1 };
  public static TextLight = { r: 255, g: 255, b: 255, a: 1 };
}
