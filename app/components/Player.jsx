import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Card, CardActions, CardTitle, CardText, CardHeader } from 'material-ui/Card';
import { setNextQuestion } from '../reducers/currentQuestion';
import { callAddToMyPoints, callSetGameStatus } from '../reducers/currentGame';


class PlayerComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      input: '',
      typing: false
    };
    this.setInput = this.setInput.bind(this);
    this.submitAnswer = this.submitAnswer.bind(this);
    this.props.socket.on('nextQuestion', () => {
      document.getElementById('myInput').value = '';
    });
  }

  componentWillUnmount() {
    this.props.socket.emit('leaveRoom', { groupId: this.props.group[0].id });
  }

  setInput(e) {
    e.preventDefault();
    this.setState({ input: e.target.value });

  }
  submitAnswer(e) {
    e.preventDefault();
    document.getElementById('myInput').value = '';
    const answer = this.props.questionList[this.props.currentQuestion].answer.toUpperCase();
    const input = this.state.input.toUpperCase();
    if (input === answer) {
      this.props.callAddToMyPoints();
      this.props.socket.emit('correct', {
        opponentPoints: this.props.currentGame.myPoints,
        groupId: this.props.group[0].id
      });
      this.props.callSetGameStatus('Correct!')
      window.setTimeout(this.props.setNextQuestion, 3000);
    } else {
      this.props.callSetGameStatus('Incorrect!')
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if(prevProps.currentQuestion !== this.props.currentQuestion) {
      if (this.props.currentQuestion === this.props.questionList.length) {
        if (this.props.currentGame.myPoints > this.props.currentGame.opponentPoints) {
          this.props.callSetGameStatus('You win!')
        } else if (this.props.currentGame.myPoints < this.props.currentGame.opponentPoints) {
            this.props.callSetGameStatus('You lose!')
        } else {
            this.props.callSetGameStatus('Tie.')
        }
      }
    }
    if (prevState.input === this.state.input) return null
    else {
      this.props.socket.emit('input', {
        opponentText: this.state.input,
        groupId: this.props.group[0].id
      });
    }
  }

  render() {
    const { status, myPoints } = this.props.currentGame;
    const { points } = style;
    return (
      <Card zDepth={5}>
        <CardHeader title="Me" subtitle={status} avatar="/default-profile-photo.png">
          <CardTitle style={points}>Points: {myPoints}</CardTitle>
        </CardHeader>
        <CardText>
            <form action="#" onSubmit={this.submitAnswer}>
              <input
                id="myInput"
                className="form-control"
                type="text"
                onChange={this.setInput}
                placeholder="Answer"
                autoFocus='true'
              />
            <label htmlFor="myInput" className="mdl-textfield__label" />
            </form>
        </CardText>
        </Card>
    );
  }
}

const mapStateToProps = ({
  questionList, currentQuestion, currentGame, socket, group }) => ({
    questionList, currentQuestion, currentGame, socket, group
  });

const mapDispatchToProps = (dispatch) => ({
  setNextQuestion: setNextQuestion(dispatch),
  callAddToMyPoints: callAddToMyPoints(dispatch),
  callSetGameStatus: callSetGameStatus(dispatch)
});

const Player = connect(mapStateToProps, mapDispatchToProps)(PlayerComponent);

export default Player;

const style = {
  points: {
    "fontSize": "40px"
  }
}