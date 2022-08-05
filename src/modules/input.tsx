import { v4 as Guid } from "uuid";
import { useContext, useEffect, useMemo } from "preact/hooks";
import WithStyles from "Src/utils/Styles";
import { IsLiteral, IsString, Optional } from "@paulpopat/safe-type";
import FormContext from "Src/contexts/Form";
import InputRules from "Src/rules/Input";
import BuildComponent from "Src/BuildComponent";

export default BuildComponent(
  {
    name: IsString,
    help: Optional(IsString),
    type: Optional(IsString),
    default: Optional(IsString),
    placeholder: Optional(IsString),
    disabled: Optional(IsLiteral(true)),
    "no-label": Optional(IsLiteral(true)),
  },
  (props) => {
    const id = useMemo(() => Guid(), []);
    const { get, set, submit } = useContext(FormContext);
    useEffect(() => set(props.name, props.default ?? ""), []);

    return WithStyles(
      <p-row flush>
        {!props["no-label"] && (
          <p-col xs="12" md="3" lg="2" centre align="right">
            <label for={id}>{props.children}</label>
          </p-col>
        )}
        <p-col
          xs="12"
          md={props["no-label"] ? undefined : "9"}
          lg={props["no-label"] ? undefined : "10"}
          centre
        >
          <input
            id={id}
            type={props.type ?? "text"}
            name={props.name}
            class="input"
            disabled={props.disabled ?? false}
            value={get(props.name)}
            placeholder={props.placeholder ?? undefined}
            onChange={(e: any) => set(props.name, e.currentTarget.value)}
            onKeyPress={(e: KeyboardEvent) => {
              if (e.key !== "Enter") return;
              e.preventDefault();
              set(props.name, (e.currentTarget as any)?.value ?? "");
              submit();
            }}
          />
          {props.help && <span class="help-text">{props.help}</span>}
        </p-col>
      </p-row>,
      InputRules
    );
  }
);
