FROM node:slim

# Set the working directory in the container
WORKDIR /mido/mido_booking_server

COPY package*.json ./

# Install dependencies
RUN npm install

# Bundle app source
COPY . .

# Expose the port your app runs on
EXPOSE 9900

# Command to run your app using node
CMD ["node", "app.js"]