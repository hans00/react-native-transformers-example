/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import SelectDropdown from 'react-native-select-dropdown';
import { pipeline } from '@xenova/transformers';
import Section from './components/form/Section';
import Progress from './components/Progress';
import * as Translation from './components/Translation';
import * as ASR from './components/ASR';

const tasks = [
  'translation',
  'text-generation',
  'masked-language-modelling',
  'sequence-classification',
  'token-classification',
  'zero-shot-classification',
  'question-answering',
  'summarization',
  'code-completion',
  'automatic-speech-recognition',
  'image-to-text',
  'image-classification',
  'zero-shot-image-classification',
  'object-detection',
];

function App(): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  const [task, setTask] = useState<Nullable<string>>(null);
  const [settings, setSettings] = useState<Nullable<object>>(null);
  const [params, setParams] = useState<Nullable<object>>(null);
  const [download, setDownload] = useState<object>({});
  const [isLoading, setLoading] = useState<boolean>(false);

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  useEffect(() => {
    setSettings(null);
    setParams(null);
    setDownload({});
    setLoading(false);
  }, [task]);

  const onProgress  = useCallback((event: any) => {
    console.log(event);
    if (event?.file) {
      const { file, status, progress } = event;
      setLoading(true);
      setDownload((prev) => ({
        ...prev,
        [file]: { status, progress },
      }));
    }
    if (event?.status === 'ready') {
      setLoading(false);
    }
  }, []);

  const run = useCallback(async (args: any) => {
    if (!task || !args?.length) return;
    let pipe;
    try {
      pipe = await pipeline(task, null, { progress_callback: onProgress });
      const result = await pipe(...args);
      pipe.dispose();
      return result;
    } catch (e) {
      console.error(e);
      pipe?.dispose();
      throw e;
    }
  }, [task, onProgress]);

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <View>
          <Text style={styles.title}># transformers.js</Text>
          <Section title="Task">
            <SelectDropdown
              data={tasks}
              onSelect={(selected) => {
                setTask(selected);
              }}
              buttonTextAfterSelection={(selectedItem) => selectedItem}
              rowTextForSelection={(item) => item}
            />
          </Section>
          <Section title="Settings">
            {task === 'translation' && <Translation.Settings onChange={setSettings} />}
            {task === 'automatic-speech-recognition' && <ASR.Settings onChange={setSettings} />}
            {!task && <Text>Select task first</Text>}
          </Section>
          <Section title="Parameters">
            {task === 'translation' && <Translation.Parameters onChange={setParams} />}
            {task === 'automatic-speech-recognition' && <ASR.Parameters onChange={setParams} />}
            {!task && <Text>N/A</Text>}
          </Section>
          {isLoading && (
            <Section title="Progress">
              <View style={styles.container}>
                {Object.entries(download).map(([key, value]) => (
                  <Progress key={key} name={key} {...value} />
                ))}
              </View>
            </Section>
          )}
          <Section title="Interact">
            <View style={styles.container}>
              {task === 'translation' && <Translation.Interact settings={settings} params={params} runPipe={run} />}
              {task === 'automatic-speech-recognition' && <ASR.Interact settings={settings} params={params} runPipe={run} />}
              {!task && <Text>N/A</Text>}
            </View>
          </Section>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  container: {
    flex: 1,
  },
});

export default App;
