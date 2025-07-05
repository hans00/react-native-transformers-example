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
import { pipeline, PipelineType } from '@huggingface/transformers';
import { useColor } from './utils/style';
import InlineSection from './components/form/InlineSection';
import Section from './components/form/Section';
import SelectField from './components/form/SelectField';
import Progress from './components/Progress';
import Models from './components/models';
import * as logger from './utils/logger';
import type { Settings, InputParams } from './components/models/common/types';

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const backgroundColor = useColor('background');
  const color = useColor('foreground');
  const textColor = { color };

  const [task, setTask] = useState<keyof typeof Models | null>(null);
  const [settings, setSettings] = useState<Settings>({});
  const [params, setParams] = useState<any>({});
  const [download, setDownload] = useState<Record<string, any>>({});
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

  const run = useCallback(async (useTask: string, model: string, modelOpt: object, ...args: any[]) => {
    if (!task || !useTask || !args?.length) {return;}
    let pipe;
    try {
      logger.time('LOAD');
      pipe = await pipeline(useTask as PipelineType, model, { ...modelOpt, progress_callback: onProgress });
      logger.timeEnd('LOAD');
      logger.time('INFER');
      // @ts-ignore
      const result = await pipe._call(...args);
      logger.timeEnd('INFER');
      await pipe.dispose();
      logger.log('Result:', result);
      return result;
    } catch (e) {
      console.error((e as Error).stack);
      await pipe?.dispose();
      throw e;
    }
  }, [task, onProgress]);

  const SettingsComponent = task && Models[task]?.Settings;
  const ParametersComponent = task && Models[task]?.Parameters;
  const InteractComponent = task && Models[task]?.Interact;

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundColor}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <View style={styles.container}>
          <Text style={[styles.title, textColor]}># transformers.js</Text>
          <InlineSection title="Task">
            <SelectField
              options={Object.entries(Models).map(([key, value]) => ({
                label: value.title,
                value: key,
              }))}
              value={task}
              onChange={(value) => setTask(value)}
              placeholder="Select a task"
            />
          </InlineSection>
          <InlineSection title="Settings">
            {SettingsComponent ? (
              <SettingsComponent onChange={(newSettings: Settings) => setSettings(newSettings)} />
            ) : (
              <Text style={textColor}>Select task first</Text>
            )}
          </InlineSection>
          <InlineSection title="Parameters">
            {ParametersComponent ? (
              <ParametersComponent onChange={(newParams: InputParams) => setParams(newParams)} />
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
              {Object.entries(download).map(([key, { progress, status }]: [string, any]) => (
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
