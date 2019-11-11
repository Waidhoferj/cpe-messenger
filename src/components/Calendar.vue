<template>
  <div class="calendar">
    <nav class="calendar-nav">
      <h1 class="year">{{year}}</h1>
      <div class="header">
        <div>
          <button class="adjacent-month" @click="subtractMonth">{{prevMonth}}</button>
        </div>
        <div>
          <h1 class="current-month">{{month}}</h1>
        </div>
        <div>
          <button class="adjacent-month" @click="addMonth">{{nextMonth}}</button>
        </div>
      </div>
      <div class="weekdays">
        <div v-for="day in days" class="day">{{day}}</div>
      </div>
    </nav>

    <div class="dates">
      <div v-for="i in firstDayOfMonth" class="spacer"></div>
      <div
        v-for="day in daysInMonth"
        class="date"
        :class="{ active: isSelected(day)}"
        :key="day"
        @click="setDate(day)"
      >{{day}}</div>
    </div>
  </div>
</template>


<script>
import moment from "moment";
export default {
  data() {
    return {
      today: moment(),
      dateContext: moment(),
      selectedDate: moment(),
      days: ["S", "M", "T", "W", "T", "F", "S"]
    };
  },
  watch: {
    selectedDate: function(val) {
      this.$emit("update:date", val.format("MM/DD/YYYY"));
    }
  },
  computed: {
    year() {
      return this.dateContext.format("Y");
    },
    month() {
      return this.dateContext.format("MMMM");
    },
    prevMonth() {
      return moment(this.dateContext)
        .subtract(1, "month")
        .format("MMM");
    },
    nextMonth() {
      return moment(this.dateContext)
        .add(1, "month")
        .format("MMM");
    },
    daysInMonth() {
      return this.dateContext.daysInMonth();
    },

    currentDate() {
      return this.dateContext.get("date");
    },

    firstDayOfMonth() {
      const firstDay = moment(this.dateContext).subtract(
        this.currentDate - 1,
        "days"
      );
      return firstDay.weekday();
    },
    initialDate() {
      return this.today.get("date");
    },
    initialMonth() {
      return this.today.format("MMMM");
    },
    initialYear() {
      return this.today.format("Y");
    }
  },
  methods: {
    isSelected(date) {
      return (
        this.selectedDate.isSame(this.dateContext, "day") &&
        date == this.selectedDate.date()
      );
    },
    addMonth() {
      this.dateContext = moment(this.dateContext).add(1, "month");
    },
    subtractMonth() {
      this.dateContext = moment(this.dateContext).subtract(1, "month");
    },

    setDate(date) {
      this.dateContext.date(date);
      this.selectedDate = this.dateContext.clone();
    }
  },
  mounted() {
    this.$emit("update:date", this.selectedDate.format("MM/DD/YYYY"));
  }
};
</script>


<style scoped>
.current-month {
  cursor: default;
  font-size: 1.5rem;
}

.adjacent-month {
  font-family: inherit;
  color: var(--main-color);
  cursor: pointer;
  font-size: 1rem;
  opacity: 0.7;
  background: none;
  border: none;
}

.calendar {
  --main-color: white;
  font-family: sans-serif;
  color: var(--main-color);
  position: relative;
  max-width: 400px;
  min-width: 400px;
  width: 98%;
  min-width: 200px;
  height: auto;
  background: transparent;
  border-radius: 10px;
  overflow: hidden;
}

.calendar-nav {
  padding: 10px 0;
  border-bottom: 4px solid var(--main-color);
  width: 100%;
  height: auto;
}

.header {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  text-align: center;
}

.month-button {
  filter: invert(1);
  border: none;
  background: none;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  outline: none;
  cursor: pointer;
}

.year {
  font-size: 0.7rem;
  text-align: center;
  margin: 0;
}

.weekdays {
  padding: 0 10px;
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  justify-content: center;
  color: var(--main-color);
}

.dates {
  margin: auto;
  padding: 10px;
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  justify-content: left;
  flex-wrap: wrap;
}

.date {
  text-align: center;
  color: var(--main-color);
  cursor: pointer;
  border-bottom: 1px solid transparent;
  transition: border-bottom 0.3s;
}

.date:hover {
  border-bottom: 1px solid var(--main-color);
}

.day {
  text-align: center;
  width: 20px;
  height: 20px;
  margin: 0 5px;
  padding: 5px;
}

.active {
  border-radius: 10px;
  background: var(--accent);
}

.spacer {
  padding: 5px;
  width: 20px;
  margin: 0 5px;
  height: 20px;
}
</style>


