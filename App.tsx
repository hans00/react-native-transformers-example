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
  useColorScheme,
  Text,
  View,
} from 'react-native';
import { pipeline } from '@xenova/transformers';
import { useColor } from './utils/style';
import InlineSection from './components/form/InlineSection';
import Section from './components/form/Section';
import SelectField from './components/form/SelectField';
import Progress from './components/Progress';
import Models from './components/models';
import { GCanvasView } from '@flyskywhy/react-native-gcanvas';
import * as logger from './utils/logger';

const tasks = Object.keys(Models);
const taskDisplayNames = tasks.map((task) => Models[task].title);

function App(): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const backgroundColor = useColor('background');
  const color = useColor('foreground');
  const textColor = { color };

  const [task, setTask] = useState<Nullable<string>>(null);
  const [settings, setSettings] = useState<Nullable<object>>(null);
  const [params, setParams] = useState<Nullable<object>>(null);
  const [download, setDownload] = useState<object>({});
  const [isLoading, setLoading] = useState<boolean>(false);

  const backgroundStyle = { backgroundColor };

  useEffect(() => {
    setDownload({});
    setLoading(false);
  }, [task]);

  const onProgress  = useCallback((event: any) => {
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

  const run = useCallback(async (useTask, ...args) => {
    if (!task || !useTask || !args?.length) return;
    let pipe;
    try {
      logger.time('LOAD');
      pipe = await pipeline(useTask, null, { progress_callback: onProgress });
      logger.timeEnd('LOAD');
      logger.time('INFER');
      const result = await pipe._call(...args);
      logger.timeEnd('INFER');
      await pipe.dispose();
      logger.log('Result:', result);
      return result;
    } catch (e) {
      console.error(e);
      await pipe?.dispose();
      throw e;
    }
  }, [task, onProgress]);

  const SettingsComponent = Models[task]?.Settings;
  const ParametersComponent = Models[task]?.Parameters;
  const InteractComponent = Models[task]?.Interact;

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundColor}
      />
      <GCanvasView
        style={{
          width: 3840, // 1000 should enough for offscreen canvas usage
          height: 2160, // or Dimensions.get('window').height * 2 like https://github.com/flyskywhy/react-native-babylonjs/commit/d5df5d2
          position: 'absolute',
          left: 1000, // 1000 should enough to not display on screen means offscreen canvas :P
          top: 0,
          zIndex: -100, // -100 should enough to not bother onscreen canvas
        }}
        offscreenCanvas
        onCanvasCreate={(canvas) => console.log('Off-screen canvas is ready')}
        devicePixelRatio={1}
        isGestureResponsible={false}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <View style={styles.container}>
          <Text style={[styles.title, textColor]}># transformers.js</Text>
          <InlineSection title="Task">
            <SelectField
              options={Object.keys(Models)}
              value={task}
              onChange={setTask}
              optionLabels={taskDisplayNames}
              placeholder="Select a task"
            />
          </InlineSection>
          <InlineSection title="Settings">
            {SettingsComponent ? (
              <SettingsComponent onChange={setSettings} />
            ) : (
              <Text style={textColor}>Select task first</Text>
            )}
          </InlineSection>
          <InlineSection title="Parameters">
            {ParametersComponent ? (
              <ParametersComponent onChange={setParams} />
            ) : (
              <Text style={textColor}>N/A</Text>
            )}
          </InlineSection>
          <Section title="Interact">
            {InteractComponent ? (
              <InteractComponent settings={settings} params={params} runPipe={run} />
            ) : (
              <Text style={textColor}>N/A</Text>
            )}
          </Section>
          {isLoading && (
            <Section title="Progress">
              {Object.entries(download).map(([key, { progress, status }]) => (
                <Progress key={key} title={key} value={progress} status={status} />
              ))}
            </Section>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  container: {
    flex: 1,
    paddingTop: 20,
    paddingBottom: 80,
  },
});

export default App;
