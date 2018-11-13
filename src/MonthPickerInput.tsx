import React, { Component } from 'react';
import InputMask from 'react-input-mask';

import MonthCalendar from './calendar';
import { valuesToMask, valuesFromMask } from './utils';

import { II18n, DEFAULT_I18N as I18n_DEF } from './i18n';
import Translator from './Translator';

import './styles/index.css';

type OnChange = (maskedValue: string, year: number, month: number) => any;

export const DEFAULT_I18N = I18n_DEF;

export interface IProps {
  year?: number,
  month?: number,
  inputProps?: {
    name?: string,
    id?: string,
  },
  lang?: string,
  onChange?: OnChange,
  closeOnSelect?: boolean,
  i18n?: Partial<II18n>
};

export interface IState {
  year: void|number,
  month: void|number,
  inputValue: string,
  showCalendar: boolean,
};

class MonthPickerInput extends Component<IProps, IState> {
  wrapper: HTMLDivElement;
  input: { input: Element };
  private t: Translator;
  private inputMask: string;

  public static defaultProps: Partial<IProps> = {
    inputProps: {},
    closeOnSelect: false
  };

  constructor(props) {
    super(props);
    const { year, month } = this.props;
    let inputValue = '';

    this.t = new Translator(this.props.lang, this.props.i18n);
    this.inputMask = this.t.dateFormat().replace(/M|Y/g, '9');

    this.state = {
      year,
      month,
      inputValue: this.valuesToMask(month, year),
      showCalendar: false,
    }
  };

  componentWillReceiveProps(nextProps: IProps): void {
    const update: Partial<IState> = {};

    if (nextProps.year !== this.props.year) { update.year = nextProps.year }
    if (nextProps.month !== this.props.month) { update.month = nextProps.month }

    if (Object.keys(update).length) {
      const month = update.month || this.state.month;
      const year = update.year || this.state.year;
      update.inputValue = this.valuesToMask(month, year);
      this.setState(update as IState);
    }
  };

  valuesToMask = (month: number|void, year: number|void): string => {
    if (typeof year == 'number' && typeof month == 'number') {
      return valuesToMask(month, year, this.t);
    } else return '';
  }

  onCalendarChange = (year: number, month: number): void => {
    const inputValue = this.valuesToMask(month, year);
    this.setState({
      inputValue,
      year,
      month,
      showCalendar: !this.props.closeOnSelect
    });
    this.onChange(inputValue, year, month);
  };

  onInputChange = (e: { target: { value: string }}): void => {
    const mask = e.target.value;

    if (mask.length && mask.indexOf('_') === -1) {
      const [month, year] = valuesFromMask(mask);
      const inputValue = this.valuesToMask(month, year);
      this.setState({ year, month, inputValue });
      this.onChange(inputValue, year, month);
    } else this.setState({ inputValue: mask });
  };

  onChange = (inputValue, year, month) => {
    if (this.props.onChange) {
      this.props.onChange(inputValue, year, month);
    }
  };

  onInputBlur = (e): void => {
    if (!this.wrapper.contains(e.target)) {
      this.setState({ showCalendar: false })
    }
  };

  onInputFocus = (e): void => {
    if (this.wrapper.contains(e.target)) {
      this.setState({ showCalendar: true });
    }
  };

  onKeyPress = (e): void => {
    if(e.keyCode === 9 || e.keyCode === 13){
      this.setState({ showCalendar: false });
    }
  };

  onCalendarOutsideClick = (e): void => {
    this.setState({ showCalendar: this.input.input == e.target });
  };

  calendar = (): JSX.Element => {
    const { year, month } = this.state;

    return (
      <div style={{ position: 'relative' }}>
        <MonthCalendar
          year={year}
          month={month}
          onChange={this.onCalendarChange}
          onOutsideClick={this.onCalendarOutsideClick}
          translator={this.t}
        />
      </div>
    )
  };

  inputProps = (): object => {
    return Object.assign({}, {
      ref: input => { if(input) this.input = input; },
      mask: this.inputMask,
      placeholder: this.t.dateFormat(),
      type: 'text',
      onBlur: this.onInputBlur,
      onKeyPress: this.onKeyPress,
      onFocus: this.onInputFocus,
      onChange: this.onInputChange,
    }, this.props.inputProps)
  };

  render() {
    const { inputValue, showCalendar } = this.state;

    return (
      <div ref={wrap => { if(wrap) this.wrapper = wrap; }}>
        <InputMask
          value={inputValue}
          {...this.inputProps()}
        />

        { showCalendar && this.calendar() }
      </div>
    );
  };
};

export { DateFormat, MonthFormat } from './i18n';

export default MonthPickerInput;
