import { createSignal, JSX, mergeProps, Show, splitProps } from "solid-js";
import { classList } from "solid-js/web";
import { registerSW } from "virtual:pwa-register";
import style from "./message.module.css";

export default function() {
  let [offlineReady, setOfflineReady] = createSignal(false);
  let [needRefresh, setNeedRefresh] = createSignal(false);
  let [breakingUpdate, setBreakingUpdate] = createSignal(false);
  let version: string;
  let updateSW = registerSW({
    onNeedRefresh: async () => {
      let versionReq = await fetch("./breaking-version.txt");
      version = await versionReq.text();
      let storedVersion = localStorage.getItem("breaking-version");
      if (version !== storedVersion) {
        setBreakingUpdate(true);
      }
      else {
        setNeedRefresh(true);
      }
    },
    onOfflineReady: async () => {
      setOfflineReady(true);
    },
  });
  let updateSWbreaking = ()=> {
    let cnfrm = confirm("Are you sure you want to update?\nAll local data will be removed!")
    if (cnfrm) {
      localStorage.clear();
      localStorage.setItem("breaking-version", version);
      updateSW();
    }
  }

  return <>
    <Message show={offlineReady()} color="green" ondismiss={()=>setOfflineReady(false)}>
      <p>You are ready to go offline!</p>
    </Message>
    <Message show={needRefresh()} color="blue" ondismiss={()=>setNeedRefresh(false)}>
      <p>An update has been detected!</p>
      <button onclick={()=>updateSW()}>Update</button>
    </Message>
    <Message show={breakingUpdate()} color="red" ondismiss={()=>setBreakingUpdate(false)}>
      <p>A breaking update has been detected!</p>
      <p>Only update if you are finished with your current session!</p>
      <button onclick={updateSWbreaking}>Update</button>
    </Message>
  </>

}

export interface MessageProps extends JSX.HTMLAttributes<HTMLDivElement> {
  color: string,
  ondismiss?: ()=>{},
  show?:boolean
} 

export function Message(props: MessageProps):JSX.Element {
  if (props.show === undefined) {
    props.show = true;
  }
  let [selected, other] = splitProps(props, ["color", "children", "show", "ondismiss"]);
  
  return <div {...other} style={{"background-color": selected.color}} classList={{[style.popup]: true, [style.hidden]: !selected.show}}>
      <span class={style.close} onclick={selected.ondismiss}>&times;</span>
      {selected.children}
    </div>
}