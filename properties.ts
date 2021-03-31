function getScriptPropetyKey(dataType: ScriptDataType, user: User): string {
  const key: scriptPropertyKey = {
    user: user,
    type: dataType,
  };

  return JSON.stringify(key);
}

function setScriptProperty(
  dataType: ScriptDataType,
  user: User,
  data: any
): void {
  const stringifiedKey: string = getScriptPropetyKey(dataType, user);

  const scriptPropertyValue: scriptPropertyData = {
    timestampMillis: Date.now(),
    data: data,
  };
  const stringifiedValue: string = JSON.stringify(scriptPropertyValue);

  var scriptProperties = PropertiesService.getScriptProperties();
  scriptProperties.setProperty(stringifiedKey, stringifiedValue);
}

function getScriptProperty(
  dataType: ScriptDataType,
  user: User
): scriptPropertyData {
  const stringifiedKey: string = getScriptPropetyKey(dataType, user);
  var scriptProperties = PropertiesService.getScriptProperties();
  var stringData: string = scriptProperties.getProperty(stringifiedKey);
  return JSON.parse(stringData);
}

function deleteScriptProperty(dataType: ScriptDataType, user: User): void {
  const stringifiedKey: string = getScriptPropetyKey(dataType, user);
  var scriptProperties = PropertiesService.getScriptProperties();
  var stringData = scriptProperties.deleteProperty(stringifiedKey);
}
