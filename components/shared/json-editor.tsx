'use client';

import React, { Component, RefObject } from 'react';
import JSONEditor from 'jsoneditor';
import 'jsoneditor/dist/jsoneditor.css';

interface JSONEditorProps {
  json: any;
  onChangeJSON?: (json: any) => void;
  mode?: 'tree' | 'view' | 'form' | 'code' | 'text';
  className?: string;
  height?: string;
  width?: string;
}

export default class JSONEditorComponent extends Component<JSONEditorProps> {
  private container: RefObject<HTMLDivElement | null>;
  private jsoneditor: any = null;

  constructor(props: JSONEditorProps) {
    super(props);
    this.container = React.createRef();
  }

  async componentDidMount() {
    if (!this.container.current) return;
    this.initializeEditor();
  }

  componentWillUnmount() {
    this.destroyEditor();
  }

  componentDidUpdate(prevProps: JSONEditorProps) {
    // Handle mode changes
    if (this.jsoneditor && prevProps.mode !== this.props.mode) {
      this.destroyEditor();
      this.initializeEditor();
    }

    // Handle json data changes
    else if (this.jsoneditor && prevProps.json !== this.props.json) {
      try {
        // Use update instead of set to preserve expanded nodes state when possible
        this.jsoneditor.update(this.props.json);
      } catch (error) {
        // Fallback to set if update fails (usually due to completely different structure)
        this.jsoneditor.set(this.props.json);
      }
    }
  }

  private initializeEditor() {
    if (!this.container.current) return;

    try {
      const options = {
        mode: this.props.mode || 'tree',
        search: true,
        onChange: () => {
          if (this.props.onChangeJSON && this.jsoneditor) {
            try {
              const updatedJson = this.jsoneditor.get();
              this.props.onChangeJSON(updatedJson);
            } catch (error) {
              console.error('Error getting JSON from editor:', error);
            }
          }
        },
      };

      this.jsoneditor = new JSONEditor(this.container.current, options);

      if (this.props.json !== undefined) {
        this.jsoneditor.set(this.props.json);
      }
    } catch (error) {
      console.error('Failed to initialize JSONEditor:', error);
    }
  }

  private destroyEditor() {
    if (this.jsoneditor) {
      this.jsoneditor.destroy();
      this.jsoneditor = null;
    }
  }

  render() {
    // const containerStyle = {
    //   height: this.props.height || '400px',
    //   width: this.props.width || '100%',
    // };

    return (
      <div
        className={`jsoneditor-react-container ${this.props.className || ''}`}
        ref={this.container}
        // style={containerStyle}
      />
    );
  }
}
