function getScriptPropetyKey(
  dataType: ScriptDataType | BQTableName,
  user: User
): string {
  const key: scriptPropertyKey = {
    user: user,
    type: dataType,
  };

  return JSON.stringify(key);
}

function setScriptProperty(
  dataType: ScriptDataType | BQTableName,
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
  dataType: ScriptDataType | BQTableName,
  user: User
): scriptPropertyData {
  const stringifiedKey: string = getScriptPropetyKey(dataType, user);
  var scriptProperties = PropertiesService.getScriptProperties();
  var stringData: string = scriptProperties.getProperty(stringifiedKey);
  return JSON.parse(stringData);
}

function deleteScriptProperty(
  dataType: ScriptDataType | BQTableName,
  user: User
): void {
  const stringifiedKey: string = getScriptPropetyKey(dataType, user);
  var scriptProperties = PropertiesService.getScriptProperties();
  var stringData = scriptProperties.deleteProperty(stringifiedKey);
}

function getScriptPropertyCacheStatus(
  dataType: ScriptDataType | BQTableName,
  user: User,
  maxStalenessMins: number
): CacheStatus {
  const currentValue = getScriptProperty(dataType, user);
  const timeSinceLastRefresh = !!currentValue
    ? (Date.now() - currentValue.timestampMillis) / (1000 * 60)
    : maxStalenessMins + 1;
  if (timeSinceLastRefresh > maxStalenessMins) {
    return CacheStatus.Stale;
  } else {
    return CacheStatus.Fresh;
  }
}
