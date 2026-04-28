---
title: "Magistrala as a framework for building solutions"
slug: "magistrala-as-framework"
excerpt: "Magistrala's building blocks give you everything you need to build IoT and industrial solutions - without starting from scratch."
description: "Explore how Magistrala can serve as the framework for building IoT and industrial solutions. We cover the key building blocks, how they work together to support flexible and scalable solutions, and what's coming next with solution packs."
date: "2026-04-13"
author:
  name: "Ian Muchiri"
  picture: "https://avatars.githubusercontent.com/u/100555904?v=4"
coverImage: "/img/blogs/magistrala-as-framework/hero.jpg"
ogImage:
  url: "/img/blogs/magistrala-as-framework/hero.jpg"
category: blog
featured: false
tags:
  - IoT
  - IIoT
  - Magistrala
  - open-source platform
  - IoT solutions
  - industrial solutions
---

# Magistrala as a framework for building solutions

[Magistrala](https://magistrala.absmach.eu/) has for the past decade been one of the best open source IoT platforms, and that track record speaks for itself. We have continuously shipped world-class features that users all over the world have relied on time and time again. All these years of development work have created the perfect building blocks for a powerful framework for building IoT and industrial solutions. With Magistrala, you have endless ways to customize your solution, while getting started is as simple as it can be. We are in the process of streamlining Magistrala as a solution-first framework platform.

## Key Concepts

Magistrala ships with numerous features. Key to these features are the building blocks of Magistrala:

1. [Users](https://magistrala.absmach.eu/docs/dev-guide/services/users/) - These are the individuals interacting with the system.
2. [Domains](https://magistrala.absmach.eu/docs/user-guide/domain-management/domain/) - These are logical groupings that separate different tenants and govern access control. Basically multi-tenancy out of the box!
3. [Roles](https://magistrala.absmach.eu/docs/dev-guide/authorization/) - Roles are a set of permissions that a user can have within the system. They allow for fine-grained access control by associating users with the actions they are allowed to perform.
4. [Groups](https://magistrala.absmach.eu/docs/user-guide/clients-management/groups/) - These are hierarchical structures used to organize clients and channels within a domain.
5. [Clients](https://magistrala.absmach.eu/docs/user-guide/clients-management/clients/) - These represent devices or applications that connect to the platform for communication.
6. [Channels](https://magistrala.absmach.eu/docs/user-guide/clients-management/channels/) - Channels are message conduits between the clients connected to them and the system. They map to topics in the message broker.
7. [Rules](https://magistrala.absmach.eu/docs/user-guide/rules-engine/) - These are scriptable logic units that enable message processing. They consume messages, apply processing logic, and output to various integrations such as alarms, email, PostgresDB, Slack, internal TimescaleDB, or forwarding to other channels.
8. [Alarms](https://magistrala.absmach.eu/docs/user-guide/alarms/) - Alarms are system-generated indicators and warnings triggered by threshold conditions defined in rules.
9. [Reports](https://magistrala.absmach.eu/docs/user-guide/reports/) - Reports allow users to generate and schedule processed information from messages coming from connected devices and sensors. This allows them to collect, aggregate, and export metrics in PDF and CSV formats either via email or direct download.
10. [Dashboards](https://magistrala.absmach.eu/docs/user-guide/dashboards/introduction/) - Dashboards allow you to build and customize real-time or historical visualizations of your data. We support templates as well; these allow the same dashboard to display different data for different users.
11. [Tags](https://magistrala.absmach.eu/docs/dev-guide/entities/#tags-filtering) - These are labels used to uniquely identify entities. They are used to filter entities when listing.
12. [Metadata](https://magistrala.absmach.eu/docs/user-guide/metadata/) - Metadata is a free-form JSON object used to attach arbitrary structured data to entities. With metadata, we give entities properties that represent their real-world counterparts.

Together, these building blocks give you the flexibility to make your Magistrala solution as simple or as sophisticated as your needs demand.

## How Magistrala works as the framework for your solution

Regardless of the solution you want to implement, Magistrala offers all the necessary tools to bring it to life. With scriptable rules, the platform becomes your canvas - you can shape it into almost anything. The same applies to groups, channels, and clients: you can design them to suit your system's needs. Our entities have been designed to be abstract while still drawing real-world meaning.

**Multi-tenancy** is built in through domains. With a single deployment, you can logically separate organizations, departments, customers, regions, and more.

**Clients** are not limited to devices. A client can be a device, an application, or anything that publishes or consumes messages.

**Groups** support hierarchy up to 5 levels deep. You can create sub-groups 5 levels down, and access control trickles through to all available sub-groups. This is crucial in sectors where you need to separate user access to clients and channels within the same tenancy.

**Channels** give you freedom in how you structure your messaging. You can have separate channels for each topic, or a single channel and publish to multiple sub-topics - whatever fits your architecture.

**Rules engine** is the backbone of an excellent IoT platform. The ability to receive, store, and visualize messages is table stakes - what truly sets a platform apart is what it does with that data the moment it arrives. In Magistrala, this is enabled via our powerful scriptable rules engine. By making the rules engine scriptable, we open up a world of opportunities for our users. You can write simple scripts or highly complex ones for processing your messages. We currently support Go and Lua scripting. To act on processed outputs, we support a number of integrations: triggering alarms, sending emails and Slack messages, saving to our internal database as SenML-formatted messages, writing to your own external Postgres database, or republishing processed messages to other channels for other clients to consume. All of this makes the platform extremely flexible.

Completing the picture is Magistrala's **visualization layer**. With dashboards, you can see your messages in motion - whether in real-time or as historical data. We support message aggregation, allowing you to surface useful analytics to members of a domain. We also support **dashboard templates**, which are dashboards with abstract data sources powered by tags. This allows a domain administrator to create a single dashboard and share it across many members - technicians, customers, or otherwise - without needing to create a unique dashboard for each and every user.

Consider this scenario: you have water meter customers and you want to show each of them their own consumption dashboard. Without templates, you would need to create a separate dashboard per customer. With templates, you create a single dashboard with tagged data sources, assign it to your customers, and when each customer logs in, Magistrala resolves their data sources so they see only the information specific to them.

## What's Next: Solution Packs

We are introducing solution packs - and this is a big one. Solution packs will be a new feature in the platform that allows you to install pre-built solutions with a single action. With solution packs, you do not need to first understand all the ins and outs of Magistrala to get started. You only have to create an account, create a domain, install the solution, and start sending messages immediately.

This will revolutionize how users onboard onto Magistrala, dramatically reducing the time from sign-up to a fully working solution. Be on the lookout for this feature - it is coming soon.

## Conclusion

With all these great features, Magistrala has positioned itself as the leading framework platform on which IoT and industrial solutions can be built. If you are interested in kickstarting your solution on Magistrala, try out our cloud platform and see the features in action.

- ☁️ **Cloud:** https://cloud.magistrala.absmach.eu
- 🌐 **Website:** https://magistrala.absmach.eu
- ⚙️ **GitHub:** https://github.com/absmach/magistrala
- 📘 **Documentation:** https://magistrala.absmach.eu/docs
- 💬 **Matrix:** https://matrix.to/#/#magistrala:matrix.org
