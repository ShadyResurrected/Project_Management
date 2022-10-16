const { projects, clients } = require('../sampleData.js')

// Mongoose Models
const Project = require('../models/Project');
const Client = require('../models/Client');

const graphql = require('graphql');

const { GraphQLObjectType, GraphQLID, GraphQLString, GraphQLSchema, GraphQLList, GraphQLNonNull, GraphQLEnumType } = graphql;

// Client Type
const ClientType = new GraphQLObjectType({
    name: 'Client',
    fields: () => ({
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        email: { type: GraphQLString },
        phone: { type: GraphQLString },
    })
});

// Project Type
const ProjectType = new GraphQLObjectType({
    name: 'Project',
    fields: () => ({
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        description: { type: GraphQLString },
        status: { type: GraphQLString },
        client: {
            type: ClientType,
            resolve(parent, args) {
                // here parent.clientId signifies the id of client in the project array
                // return clients.find(client => client.id === parent.clientId);
                return Client.findById(parent.clientId);
            }
        }
    })
});

// Basic Syntax of a query
const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        // The Query syntax for project

        projects: {
            type: new GraphQLList(ProjectType),
            resolve(parent, args) {
                return Project.find(); // This will help to find everything in the database
            }
        },
        project: {
            type: ProjectType,
            args: { id: { type: GraphQLID } },
            // The response is returned by resolve method
            resolve(parent, args) {
                // return projects.find((project) => project.id === args.id);
                return Project.findById(args.id);
            }
        },


        // The Query syntax for clients

        clients: {
            type: new GraphQLList(ClientType),
            resolve(parent, args) {
                return Client.find(); // Return all the clients
            }
        },
        client: {
            type: ClientType,
            args: { id: { type: GraphQLID } },
            // The response is returned by resolve method
            resolve(parent, args) {
                // return clients.find(client => client.id === args.id);
                return Client.findById(args.id);
            }
        }
    }
});


// Mutation - These defines the CRUD operations unless like queries
const mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        addClient: {
            type: ClientType,
            args: {
                name: { type: GraphQLNonNull(GraphQLString) },
                email: { type: GraphQLNonNull(GraphQLString) },
                phone: { type: GraphQLNonNull(GraphQLString) },
            },
            resolve(parent, args) {
                const client = new Client({
                    name: args.name,
                    email: args.email,
                    phone: args.phone,
                });

                return client.save();
            },
        },
        // Delete a client
        deleteClient: {
            type: ClientType,
            args: {
                id: { type: GraphQLNonNull(GraphQLID) },
            },
            resolve(parent, args) {
                Project.find({clientId: args.id}).then((projects) => {
                    projects.forEach(project => {
                        project.remove();
                    });
                });
                return Client.findByIdAndRemove(args.id);
            },
        },
        // Add a Project
        addProject: {
            type: ProjectType,
            args: {
                name: { type: GraphQLNonNull(GraphQLString) },
                description: { type: GraphQLNonNull(GraphQLString) },
                status: {
                    type: new GraphQLEnumType({
                        name: 'ProjectStatus',
                        values: {
                            'new': { value: 'Not Started' },
                            'progress': { value: 'In Progress' },
                            'completed': { value: 'completed' }
                        }
                    }),
                    defaultValue: 'Not started',
                },
                clientId: { type: GraphQLNonNull(GraphQLID) },
            },
            resolve(parent, args) {
                const project = new Project({
                    name: args.name,
                    description: args.description,
                    status: args.status,
                    clientId: args.clientId,
                });

                return project.save();
            },
        },

        // Delete a Project
        deleteProject: {
            type: ProjectType,
            args: {
                id: { type: GraphQLNonNull(GraphQLID) },
            },
            resolve(parent, args) {
                return Project.findByIdAndRemove(args.id);
            }
        },
        // Update Project
        updateProject: {
            type: ProjectType,
            args: {
                id: { type: GraphQLNonNull(GraphQLID) },
                name: { type: GraphQLString },
                description: { type: GraphQLString },
                status: {
                    type: new GraphQLEnumType({
                        name: 'ProjectStatusUpdate',
                        values: {
                            'new': { value: 'Not Started' },
                            'progress': { value: 'In Progress' },
                            'completed': { value: 'completed' }
                        }
                    })
                },
            },
            resolve(parent, args) {
                return Project.findByIdAndUpdate(
                    args.id,
                    {
                        $set: {
                            name: args.name,
                            dsecription: args.description,
                            status: args.status,
                        },
                    },
                    { new: true }
                );
            }
        }
    }
});


module.exports = new graphql.GraphQLSchema({
    query: RootQuery,
    mutation
})