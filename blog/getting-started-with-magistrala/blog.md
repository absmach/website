# Getting Started with Magistrala: From Zero to Your First Connected Device

Building a production-ready IoT platform is hard.

Teams must handle secure device authentication, multi-protocol
messaging, scalability, multi-tenancy, and real-time data flow across cloud and edge environments. Many solutions solve only part of
the problem, leaving engineers to stitch together brokers,
authentication systems, and custom services.

Magistrala is designed to address this challenge with a modular,
scalable, and secure IoT platform built for real-world deployments.

---

## Table of Contents

- [Why Magistrala's Architecture Matters](#why-magistralas-architecture-matters)
- [Core Concepts](#core-concepts)
- [Prerequisites](#prerequisites)
- [Running Magistrala Locally](#running-magistrala-locally)
- [Using Magistrala Cloud](#using-magistrala-cloud)
- [Creating Your First IoT Flow](#creating-your-first-iot-flow)
  - [Step 1: Create a User and Domain](#step-1-create-a-user-and-domain)
  - [Step 2: Create a Client (Device)](#step-2-create-a-client-device)
  - [Step 3: Set Up a Channel and Connect the Client](#step-3-set-up-a-channel-and-connect-the-client)
  - [Step 4: Create a Rule to Store Data](#step-4-create-a-rule-to-store-data)
  - [Step 5: Simulate Device Sending Temperature Data](#step-5-simulate-device-sending-temperature-data)
  - [Step 6: Visualize Data on a Dashboard](#step-6-visualize-data-on-a-dashboard)
- [Conclusion](#conclusion)

---

## Why Magistrala's Architecture Matters

Magistrala is built as a microservices-based IoT platform focusing on:

- Secure device identity and access control
- Support for multiple protocols
- Scalable message handling
- Multi-tenancy for users and domains
- Open-source and extensible design

Core components include:

- Users & Domains
- Clients (devices)
- Channels
- Groups
- Protocol Adapters
- Message Broker and Events streaming

---

## Core Concepts

### Clients

Represent physical or virtual devices with unique credentials. Can be an IOT device, application, or service.

### Channels

Secure communication paths controlling message flow.

### Groups

Logical collections of clients and channels for easier management.

### Domains

Multi-tenant environments isolating groups, clients, and channels.

### Protocol Adapters

Support MQTT, HTTP, CoAP, WebSocket feeding into a unified broker.

---

In this guide we will walk through setting up a local Magistrala instance, creating a simple IoT flow, and understanding the architecture in action.

## Prerequisites

- [Docker](https://docs.docker.com/get-started/get-docker/)(version 26.0+)

---

## Running Magistrala Locally

With docker installed, we can clone the Magistrala repository and quickly start up the platform using the provided makefile.

We can interact with the platform using the `magistrala-cli`, the api defined in the [API reference](https://docs.magistrala.io/api-reference) or the Magistrala-UI.

Note: To use the Magistrala-UI, you will need to accept the End User License Agreement (EULA) detailed [here](https://github.com/absmach/eula). To do this locally we will set the
`MG_UI_DOCKER_ACCEPT_EULA` environment variable to yes before running the `make run_stable` command.

```bash
git clone https://github.com/absmach/magistrala.git
cd magistrala
export MG_UI_DOCKER_ACCEPT_EULA=yes
## To run the latest stable(tagged) version
make run_stable
```

The above command will start up all the necessary containers for a local Magistrala instance. The UI will be available at `http://localhost:3000`

---

## Using Magistrala Cloud

If you prefer not to run Magistrala locally, you can sign up for a free account on [Magistrala Cloud](https://cloud.magistrala.io). This hosted version provides the same features without the need for local setup. It also includes additional cloud-specific features like managed scaling and Social Sign-On (SSO). Try it today!

### Screenshot Placeholder

Description: Magistrala UI login screen.

---

## Creating Your First IoT Flow

To demonstrate Magistrala's capabilities, we will create a simple flow where a device sends temperature data to the platform, and we visualize it in real-time.
The flow will involve:

1. Creating a user and a domain
2. Creating a client (device)
3. Setting up a channel for communication and connecting the client to it
4. Creating a rule to store data from the device into the internal database
5. Simulating the device sending temperature data
6. Visualizing the data on a dashboard

### Step 1: Create a User and Domain

Using the Magistrala-UI, the landing page is the login page. As we do not have an account yet, we will click on the "Sign Up" button to create a new account.

### Screenshot Placeholder

Description: Magistrala UI sign up screen 1 and 2

---

After filling in the required information and submitting the form, we will be logged in and taken to the domains page.

### Screenshot Placeholder

Description: Domains page

---

We can now create a new domain by clicking on the "Create Domain" button. We will give our domain a name and a unique route. The route can be used by devices while sending messages to the platform.

### Screenshot Placeholder

Description: Domains page with created domain

---

We can now click on our newly created domain to view its details. This is where we will manage all the clients, channels, groups, and rules for this domain.

### Screenshot Placeholder

Description: Domain page

### Screenshot Placeholder

Description: Domain details page

---

### Step 2: Create a Client (Device)

Next, we will create a client to represent our IoT device. We can do this by navigating to the "Clients" tab within our domain and clicking on the "Create" button.

Among the required fields we can provide during client creation is the client key. This is required to be a unique identifier for the client within the domain. It can be any string, but it's common to use something that reflects the device's identity, such as a serial number or a descriptive name. If we do not provide a client key, one will be automatically generated for us.

### Screenshot Placeholder

Description: Clients page with create button

### Screenshot Placeholder

Description: Create client form

### Screenshot Placeholder

Description: Clients page with created client

After creating the client, we will be able to view its details, including its unique credentials that we will use to authenticate it when sending messages. We will require the client ID and the client secret for our device to connect to the platform.

### Step 3: Set Up a Channel and Connect the Client

Next, we will set up a channel for our client to communicate through. Channels in Magistrala are used to control the flow of messages between clients and the platform. We can create a channel by navigating to the "Channels" tab within our domain and clicking on the "Create" button.

### Screenshot Placeholder

Description: Channels page with create button

### Screenshot Placeholder

Description: Create channel form

### Screenshot Placeholder

Description: Channels page with created channel

After creating the channel, we will need to connect our client to it. This can be done by clicking on the channel we just created and navigating to the `Connections` tab. Here we can click on the `Connect` button and select our client from the list of available clients. We will enable our client to both publish and subscribe to messages on this channel.

### Screenshot Placeholder

Description: Channel connections page with connect button

### Screenshot Placeholder

Description: Connect client to channel form

### Screenshot Placeholder

Description: Channel connections page with connected client

### Step 4: Create a Rule to Store Data

Next, we will create a rule to store the data sent by our device into the internal database. Rules in Magistrala allow us to define actions that should be taken when certain conditions are met. We can create a rule by navigating to the "Rules" tab within our domain and clicking on the "Create" button.

### Screenshot Placeholder

Description: Rules page with create button

### Screenshot Placeholder

Description: Create rule form

Building the Rule
Add Input Node

Click Add Input and choose Channel Subscriber.
Select the channel you want to subscribe to from the list.
(Optional) Add a topic for more specific filtering.
The input node will now appear on the canvas.
Add Logic Node

Click Add Logic and choose Lua Script Editor.
There is a default logicFunction that can return the SenML payload of incoming messages or you can enter your own rule logic, for example:
function logicFunction()
return message.payload
end

Add Output Node

Click Add Output and choose Internal DB to store messages in the Magistrala Postgres database.
(Optional) Add Schedule

Click Add Schedule to open the scheduler dialog.
Set the Start Time, Recurring Interval, and Recurring Period as needed.

Save a Rule
Once you have added all required nodes (Input, Logic, and Output), click Save Rule.
A dialog will appear where you can enter the Rule Name and optional Tags.
Click Create to save the rule.
With the rule created, any messages sent by our device to the channel will be processed by the rule and stored in the internal database. We can now proceed to simulate our device sending temperature data.

### Step 5: Simulate Device Sending Temperature Data

To simulate our device sending temperature data, we can use the HTTP protocol via a curl command. We will send a POST request to the Magistrala API endpoint for publishing messages to a channel. The request will include the client credentials for authentication, the channel route, and the message payload containing the temperature data.

The data we send should be in the SenML format, which is a common format for representing sensor data. An example payload might look like this:

```json
{
  "bn": "urn:dev:mac:00124b0004c8a591",
  "bt": 1638316800,
  "e": [
    {
      "n": "temperature",
      "v": 22.5
    }
  ]
}
```

```bash
curl -s -S -i -X POST \
  http://localhost:8008/m/<domain_id>/c/<channel_id>/temperature \
  -H "Content-Type: application/json" \
  -u "{client_id}:{client_secret}" \
  -d '{
  "bn": "urn:dev:mac:00124b0004c8a591",
  "bt": 1638316800,
  "e": [
    {
      "n": "temperature",
      "v": 22.5
    }
  ]
}'
```

This can also be done using the UI by navigating to the Messages tab of the Group-Channel and clicking on `Send Message` button.

### Screenshot Placeholder

Description: Send message form in the UI

This will open a dialog box where all the required fields bear an asterisk. Messages are sent via HTTP protocol in the UI.

### Screenshot Placeholder

Description: Send message form in the UI with required fields

The messages table will then update to include the message sent with the latest message appearing first. Using the filter options, you can filter through a wide range of messages based on the protocol, publisher or even value.

### Screenshot Placeholder

Description: Send message page with sent message and filter options

Some advanced filters allow the user to filter based on the required value type, such as boolean or string values. The time filter allows the user to select a date and define a specific time window using the date-time picker. The user can also find aggregate values of messages provided they add an interval as well as a From and To time. With these values you can get the Maximum, Minimum, Average and Count value of messages within a certain time period.

The user can also download a list of messages based on selected filters and view them in a .csv file by clicking the Download Messages button at the top right of the messages table.

### Screenshot Placeholder

Description: Download messages button and download options

### Step 6: Visualize Data on a Dashboard

To visualize the temperature data sent by our device, we can create a dashboard in Magistrala. Dashboards allow us to create visual representations of our data using various widgets such as charts, gauges, and tables. More information on dashboards can be found [here](https://docs.magistrala.absmach.eu/user-guide/dashboards/). We can create a dashboard by navigating to the "Dashboards" tab within our domain and clicking on the "Create" button.

### Screenshot Placeholder

Description: Dashboards page with create button

### Screenshot Placeholder

Description: Create dashboard form

We can then click on our newly created dashboard to add widgets. For visualizing our temperature data, we can add a line chart widget that displays the temperature values over time.

To create the widget, click on `Edit Mode` and then `Add Widget`. We will select the Line Chart widget and configure it to display the temperature data from our channel. We will select the channel we created earlier as the data source and specify the appropriate fields for the x-axis (time) and y-axis (temperature).

### Screenshot Placeholder

Description: Add widget form with line chart options

### Screenshot Placeholder

Description: Line chart widget configuration form

We have to specify the name of the data value. The combination of the `n` and `bn` fields in the SenML payload will be used to identify the data value. In our example, the `n` field is "temperature" and the `bn` field is "urn:dev:mac:00124b0004c8a591". Therefore, the name of our data value will be "urn:dev:mac:00124b0004c8a591/temperature".

After configuring the widget, we can save it and view our dashboard. As we send more temperature data from our device, the line chart will update in real-time to reflect the new data points.

### Screenshot Placeholder

Description: Dashboard with line chart widget displaying temperature data

## Conclusion

In this guide, we walked through the process of setting up a local Magistrala instance, creating a simple IoT flow, and visualizing data in real-time. Magistrala's modular architecture and powerful features make it an excellent choice for building production-ready IoT platforms. Whether you choose to run it locally or use the hosted cloud version, Magistrala provides the tools you need to connect devices, manage data, and create insightful dashboards with ease.

Ready to explore? [Start your free trial](https://cloud.magistrala.absmach.eu) or [dive into the docs](https://docs.magistrala.absmach.eu).
