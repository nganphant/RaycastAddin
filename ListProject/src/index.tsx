import { useCachedPromise, useExec } from "@raycast/utils";
import { useState } from "react";
import { Action, ActionPanel, Color, Icon, Image, List } from "@raycast/api";
// import { exec } from "child_process";
// import { promisify } from "util";
import { ProjectType, XcodeProjectInfo } from "./model";
import { XcodeProjectFavoriteService } from "./XcodeProjectFavoriteService";
import { XcodeProjectOpenCounter } from "./XcodeProjectOpenCounter";
import { Helper } from "./helper";

/**
 * Spawns a shell then executes the command within that shell, buffering any generated output.
 */
// export const execAsync = promisify(exec);

// const brewPath = "/Users/nganphanthanh/.pyenv/shims/python3"
// const app = "/Users/nganphanthanh/Documents/TOOLS/RayCast/ScriptCommand/pyUtil/searchFile.py"
// const folderPath = "/Users/nganphanthanh/Documents/REPOSITORY";
var colorListDict = new Map()
const colorList = [Color.Red, Color.Blue, Color.Yellow, Color.Green, Color.Magenta];

export  default function Command() {
  // console.log("BEGIN");

  // const [seed, setSeed] = useState(true);

  const { isLoading, data } = useExec(Helper.brewPath, [Helper.app, Helper.folderPath, "--json=v2", "--installed"]);
  const counterStatus = useCachedPromise(XcodeProjectOpenCounter.counters);
  const xcodes = useCachedPromise(Helper.xcodeProjects, [data ?? "", counterStatus.data??[]]);
  const favoriteStatus = useCachedPromise(XcodeProjectFavoriteService.favorites);

  // get favorite
  let favorite = xcodes.data?.filter((x) => {
    return favoriteStatus.data?.includes(x.path)
  });

  let normalProject = xcodes.data?.filter((x) => {
    return !favoriteStatus.data?.includes(x.path)
  });

  // favorite?.forEach((element: XcodeProjectInfo) => {
  //   console.log("FOVAROITE: "+element.title);
  // });

  return (
    <List isLoading={isLoading} navigationTitle={Helper.folderPath}>
       <List.Section title="Favorite" subtitle={"⭐️ " + favorite?.length +" Projects"}>
       {
           favorite?.map((item:XcodeProjectInfo) => (
              <CreateItem xcodeProject={item} key={item.id} isFavorite={true} reloadFavorite={favoriteStatus.revalidate} reloadCounter={counterStatus.revalidate}/>
            ))
        }
      </List.Section>
      <List.Section title="Projects" subtitle={normalProject?.length + " Projects"}>
        {
          normalProject?.map((item:any) => (
            <CreateItem xcodeProject={item} key={item.id} isFavorite={false} reloadFavorite={favoriteStatus.revalidate} reloadCounter={counterStatus.revalidate}/>
          ))
        } 
      </List.Section>
    </List>
  );
}

async function changeFavorite(isFavorite: boolean, item: XcodeProjectInfo){
  if (isFavorite) {
    await XcodeProjectFavoriteService.addToFavorites(item);
  }else{
    await XcodeProjectFavoriteService.removeFromFavorites(item);
  }
}

export function CreateItem(props: {
  xcodeProject: XcodeProjectInfo;
  isFavorite: boolean;
  reloadFavorite: () => void;
  reloadCounter: () => void;
}) {
  let item = props.xcodeProject;
  let sPath = Helper.shortPath(item.path);
  sPath = Helper.fileWithoutExt(sPath);
  let keywords: string[] = []
  keywords.push(sPath.replace(/[\s_,/\\-]+/, ""))
  
  // let tagVal = item.tag.length == 0 ? undefined : { value: item.tag, color: Color.Yellow }
  let tagList = [];
  tagList.push(
    { text: { value: item.openCount+"", color: Color.PrimaryText }, tooltip: "Opened "+item.openCount+" times" },
  );

  if (item.tag.length != 0) {

    if (!colorListDict.has(item.tag)) {
      colorListDict.set(item.tag, colorListDict.size);
    }

    let clrIdx = colorListDict.get(item.tag);
    let color = colorList[clrIdx % colorList.length];

    tagList.push({ tag: { value: item.tag, color: color }, tooltip: "FINDER tag: "+item.tag })
    keywords.push(item.tag)

  }

  return (
    <List.Item
      icon={{source : item.projectType == ProjectType.XCODEPROJ ? "xcode-project.png" : "xcode-workspace.png"}}
      title={{ value: item.title,
              tooltip: item.path,
            }}
      subtitle={{
              value: sPath,
              tooltip: item.path,
            }}
            
      keywords={keywords} accessories={tagList}
      actions={
            <ActionPanel>
                <Action.Open
                  application="com.apple.dt.Xcode"
                  title="Open with Xcode"
                  target={item.path}
                  icon={Icon.Hammer}
                  onOpen={async ()=>{
                    await XcodeProjectOpenCounter.addCounter(item);
                    props.reloadCounter();
                  }}
                  />
                <Action.ShowInFinder title="Show In Finders" path={item.path}/>
                <Action title={props.isFavorite ? "Remove from Favorite" : "Add to Favorite"} icon={props.isFavorite ? Icon.StarDisabled : Icon.Star} onAction={async ()=>{
                    await changeFavorite(!props.isFavorite, item);
                    props.reloadFavorite();
                }} />
              </ActionPanel>
            }
    />
  );
}
