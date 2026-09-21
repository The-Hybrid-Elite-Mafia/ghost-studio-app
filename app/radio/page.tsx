import Radio from "./radio";
import "./radio.css";
import {requireChatGPTUser} from "../chatgpt-auth";
export default async function RadioPanel(){await requireChatGPTUser("/#dashboard");return <Radio/>;}
